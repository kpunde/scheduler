package in.myratech.scheduler.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.myratech.scheduler.entity.JobDetails;
import in.myratech.scheduler.entity.JobExecutionHistory;
import in.myratech.scheduler.repo.JobDetailsRepository;
import in.myratech.scheduler.repo.JobExecutionHistoryRepository;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryRegistry;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.util.Map;

@Component
public class RestJob implements Job {
    private static final Logger log = LoggerFactory.getLogger(RestJob.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JobExecutionHistoryRepository historyRepository;

    @Autowired
    private JobDetailsRepository jobDetailsRepository;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Autowired
    private RetryRegistry retryRegistry;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        String jobName = context.getJobDetail().getKey().getName();
        String jobGroup = context.getJobDetail().getKey().getGroup();

        JobDetails jobDetails = jobDetailsRepository.findByJobNameAndJobGroup(jobName, jobGroup)
                .orElseThrow(() -> {
                    String error = String.format("Job not found with name: %s and group: %s", jobName, jobGroup);
                    log.error(error);
                    return new JobExecutionException(error);
                });

        log.info("Starting execution of job: {} (UUID: {})", jobName, jobDetails.getId());

        JobExecutionHistory history = new JobExecutionHistory();
        history.setJobId(jobDetails.getId());
        history.setTriggerName(context.getTrigger().getKey().getName());
        history.setStartTime(new Timestamp(System.currentTimeMillis()));

        CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker(jobName);
        Retry retry = retryRegistry.retry(jobName);

        try {
            JobDataMap dataMap = context.getJobDetail().getJobDataMap();

            String url = validateParameter(dataMap, "url", "URL");
            String method = validateParameter(dataMap, "method", "HTTP Method");
            String requestBody = dataMap.getString("requestBody");
            String headers = dataMap.getString("headers");

            log.debug("Job parameters - URL: {}, Method: {}, Headers Present: {}, Body Present: {}",
                    url, method, headers != null, requestBody != null);

            HttpHeaders httpHeaders = new HttpHeaders();
            if (headers != null && !headers.isEmpty()) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> headerMap = mapper.readValue(headers, Map.class);
                    headerMap.forEach(httpHeaders::add);
                    log.debug("Parsed headers: {}", headerMap.keySet());
                } catch (Exception e) {
                    log.warn("Failed to parse headers: {}", e.getMessage());
                }
            }

            HttpEntity<?> entity = new HttpEntity<>(requestBody, httpHeaders);

            // Execute with circuit breaker and retry
            ResponseEntity<String> response = Retry.decorateFunction(retry,
                    CircuitBreaker.decorateFunction(circuitBreaker,
                            (ignored) -> makeHttpCall(method, url, entity)
                    )).apply(null);

            history.setStatus("SUCCESS");
            if (response != null) {
                history.setErrorMessage("Response Status: " + response.getStatusCode());
                log.info("Job execution successful. Response Status: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            history.setStatus("FAILED");
            history.setErrorMessage(e.getMessage());
            log.error("Job execution failed: {}", e.getMessage(), e);
            throw new JobExecutionException(e);
        } finally {
            history.setEndTime(new Timestamp(System.currentTimeMillis()));
            historyRepository.save(history);
            log.info("Job execution history saved for job: {}", jobName);
        }
    }

    private ResponseEntity<String> makeHttpCall(String method, String url, HttpEntity<?> entity) {
        log.info("Executing {} request to {}", method, url);
        return switch (method.toUpperCase()) {
            case "GET" -> restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            case "POST" -> restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            case "PUT" -> restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
            case "DELETE" -> restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
            default -> throw new IllegalArgumentException("Unsupported HTTP method: " + method);
        };
    }

    private String validateParameter(JobDataMap dataMap, String key, String paramName) throws JobExecutionException {
        String value = dataMap.getString(key);
        if (value == null || value.trim().isEmpty()) {
            String error = paramName + " is required but was not provided";
            log.error(error);
            throw new JobExecutionException(error);
        }
        return value.trim();
    }
}