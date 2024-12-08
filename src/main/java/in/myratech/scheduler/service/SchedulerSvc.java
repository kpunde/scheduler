package in.myratech.scheduler.service;

import in.myratech.scheduler.entity.JobDetails;
import in.myratech.scheduler.entity.JobExecutionHistory;
import in.myratech.scheduler.job.RestJob;
import in.myratech.scheduler.repo.JobDetailsRepository;
import in.myratech.scheduler.repo.JobExecutionHistoryRepository;
import in.myratech.scheduler.util.error.JobNotFoundException;
import jakarta.transaction.Transactional;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SchedulerSvc {
    private static final Logger log = LoggerFactory.getLogger(SchedulerSvc.class);

    @Autowired
    private Scheduler scheduler;

    @Autowired
    private JobDetailsRepository jobDetailsRepository;

    @Autowired
    private JobExecutionHistoryRepository jobExecutionHistoryRepository;

    public void createJob(JobDetails jobDetails) throws SchedulerException {
        log.info("Creating new job. Name: {}, Group: {}", jobDetails.getJobName(), jobDetails.getJobGroup());
        try {
            JobDataMap jobDataMap = new JobDataMap();
            jobDataMap.put("url", jobDetails.getUrl());
            jobDataMap.put("method", jobDetails.getMethod());
            jobDataMap.put("requestBody", jobDetails.getRequestBody());
            jobDataMap.put("headers", jobDetails.getHeaders());

            log.debug("Job parameters - URL: {}, Method: {}, Headers: {}",
                    jobDetails.getUrl(), jobDetails.getMethod(), jobDetails.getHeaders());

            JobDetail jobDetail = JobBuilder.newJob(RestJob.class)
                    .withIdentity(jobDetails.getJobName(), jobDetails.getJobGroup())
                    .usingJobData(jobDataMap)
                    .build();

            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(jobDetails.getJobName() + "Trigger", jobDetails.getJobGroup())
                    .withSchedule(CronScheduleBuilder.cronSchedule(jobDetails.getCronExpression()))
                    .build();

            scheduler.scheduleJob(jobDetail, trigger);
            jobDetailsRepository.save(jobDetails);
            log.info("Job created successfully with ID: {}", jobDetails.getId());

        } catch (Exception e) {
            log.error("Failed to create job. Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Page<JobDetails> getAllJobs(Pageable pageable) {
        log.info("Fetching all active jobs with pagination");
        Page<JobDetails> jobs = jobDetailsRepository.findAll(pageable);
        log.debug("Found {} active jobs", jobs.getTotalElements());
        return jobs;
    }

    public JobDetails getJobStatus(UUID jobId) {
        log.info("Fetching status for job ID: {}", jobId);
        return jobDetailsRepository.findById(jobId)
                .orElseThrow(() -> new JobNotFoundException(jobId));
    }

    public Page<JobDetails> getJobsByStatus(boolean active, Pageable pageable) {
        log.info("Fetching jobs by status: {}", active ? "Active" : "Inactive");
        return jobDetailsRepository.findByActive(active, pageable);
    }

    public void deleteJob(UUID jobId) throws SchedulerException {
        log.info("Deleting job with ID: {}", jobId);
        try {
            JobDetails jobDetails = jobDetailsRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

            scheduler.deleteJob(new JobKey(jobDetails.getJobName(), jobDetails.getJobGroup()));

            jobDetails.setDeleted(true);
            jobDetails.setActive(false);
            jobDetailsRepository.save(jobDetails);
            log.info("Job deleted successfully. Name: {}, Group: {}",
                    jobDetails.getJobName(), jobDetails.getJobGroup());

        } catch (Exception e) {
            log.error("Failed to delete job with ID: {}. Error: {}", jobId, e.getMessage(), e);
            throw e;
        }
    }

    public Page<JobExecutionHistory> getJobExecutionHistory(UUID jobId, Pageable pageable) {
        log.info("Fetching execution history for job ID: {} with pagination", jobId);
        try {
            // Verify job exists
            JobDetails jobDetails = jobDetailsRepository.findById(jobId)
                    .orElseThrow(() -> new JobNotFoundException(jobId));

            // Fetch execution history with pagination
            Page<JobExecutionHistory> history = jobExecutionHistoryRepository.findByJobIdOrderByStartTimeDesc(jobId, pageable);
            log.debug("Found {} execution records for job: {} ({})",
                    history.getTotalElements(), jobDetails.getJobName(), jobId);

            return history;
        } catch (JobNotFoundException e) {
            log.error("Failed to fetch history - job not found with ID: {}", jobId);
            throw e;
        } catch (Exception e) {
            log.error("Error fetching execution history for job ID: {}. Error: {}",
                    jobId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch job execution history", e);
        }
    }
}
