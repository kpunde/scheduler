package in.myratech.scheduler.repo;

import in.myratech.scheduler.entity.JobDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobDetailsRepository extends JpaRepository<JobDetails, UUID> {
    Page<JobDetails> findByActiveTrue(Pageable pageable); // Use Page instead of List
    Optional<JobDetails> findByJobNameAndJobGroup(String jobName, String jobGroup);
    Optional<JobDetails> findByIdAndDeletedFalse(UUID jobId);
    Page<JobDetails> findByActive(boolean active, Pageable pageable);
}
