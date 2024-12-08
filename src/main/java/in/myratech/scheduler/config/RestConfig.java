package in.myratech.scheduler.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestConfig {

    @Value("${rest.template.connection.timeout:3000}")
    private int connectionTimeout;

    @Value("${rest.template.read.timeout:3000}")
    private int readTimeout;

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofMillis(1000))
                .slidingWindowSize(2)
                .build();

        return CircuitBreakerRegistry.of(circuitBreakerConfig);
    }

    @Bean
    public RetryRegistry retryRegistry() {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofSeconds(1))
                .build();
        return RetryRegistry.of(config);
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();

        SimpleClientHttpRequestFactory rf =
                (SimpleClientHttpRequestFactory) restTemplate.getRequestFactory();
        rf.setConnectTimeout(connectionTimeout);
        rf.setReadTimeout(readTimeout);

        return restTemplate;
    }
}