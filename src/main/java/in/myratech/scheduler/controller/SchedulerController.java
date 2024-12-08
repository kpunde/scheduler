package in.myratech.scheduler.controller;

import in.myratech.scheduler.entity.JobDetails;
import in.myratech.scheduler.entity.JobExecutionHistory;
import in.myratech.scheduler.service.SchedulerSvc;
import jakarta.persistence.EntityNotFoundException;
import org.quartz.SchedulerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/jobs")
public class SchedulerController {
    private static final Logger log = LoggerFactory.getLogger(SchedulerController.class);

    @Autowired
    private SchedulerSvc schedulerService;

    @PostMapping
    public ResponseEntity<String> createJob(@RequestBody JobDetails jobDetails) {
        log.info("Received request to create job: {}", jobDetails.getJobName());
        try {
            schedulerService.createJob(jobDetails);
            log.info("Job creation successful");
            return ResponseEntity.ok("Job created successfully");
        } catch (SchedulerException e) {
            log.error("Job creation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create job: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<JobDetails>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String status) {
        log.info("Received request to fetch jobs with pagination and status filter: {}", status);

        Pageable pageable = PageRequest.of(page, size);
        Page<JobDetails> jobs;

        // Filter jobs based on the status parameter
        switch (status.toUpperCase()) {
            case "ACTIVE":
                jobs = schedulerService.getJobsByStatus(true, pageable);
                break;
            case "INACTIVE":
                jobs = schedulerService.getJobsByStatus(false, pageable);
                break;
            case "ALL":
            default:
                jobs = schedulerService.getAllJobs(pageable);
                break;
        }

        return ResponseEntity.ok(jobs);
    }


    @GetMapping("/{jobId}")
    public JobDetails getJobStatus(@PathVariable UUID jobId) {
        log.info("Received request to get status for job ID: {}", jobId);
        return schedulerService.getJobStatus(jobId);
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJob(@PathVariable UUID jobId) {
        log.info("Received request to delete job ID: {}", jobId);
        try {
            schedulerService.deleteJob(jobId);
            log.info("Job deletion successful");
            return ResponseEntity.ok("Job deleted successfully");
        } catch (SchedulerException e) {
            log.error("Job deletion failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete job: " + e.getMessage());
        }
    }

    @GetMapping("/{jobId}/history")
    public ResponseEntity<Page<JobExecutionHistory>> getJobExecutionHistory(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Received request to fetch execution history for job ID: {} with pagination", jobId);
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<JobExecutionHistory> history = schedulerService.getJobExecutionHistory(jobId, pageable);
            return ResponseEntity.ok(history);
        } catch (EntityNotFoundException e) {
            log.error("Job not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching job history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
