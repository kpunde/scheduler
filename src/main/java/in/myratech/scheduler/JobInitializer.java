package in.myratech.scheduler;

import in.myratech.scheduler.entity.JobDetails;
import in.myratech.scheduler.service.SchedulerSvc;
import jakarta.persistence.EntityManager;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JobInitializer implements ApplicationListener<ApplicationReadyEvent> {
    @Autowired
    private EntityManager entityManager;

    @Autowired
    private SchedulerSvc schedulerSvc;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        List<JobDetails> jobs = entityManager.createQuery("SELECT j FROM JobDetails j WHERE j.active = true", JobDetails.class)
                .getResultList();

        jobs.forEach(job -> {
            try {
                schedulerSvc.createJob(job);
            } catch (SchedulerException e) {
                // Log error
            }
        });
    }
}
