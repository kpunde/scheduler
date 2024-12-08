package in.myratech.scheduler.repo;

import in.myratech.scheduler.entity.JobExecutionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobExecutionHistoryRepository extends JpaRepository<JobExecutionHistory, UUID> {
    Page<JobExecutionHistory> findByJobIdOrderByStartTimeDesc(UUID jobId, Pageable pageable); // Use Page instead of List
    Page<JobExecutionHistory> findByStatusOrderByStartTimeDesc(String status, Pageable pageable);
    Page<JobExecutionHistory> findByStartTimeBetweenOrderByStartTimeDesc(Timestamp startTime, Timestamp endTime, Pageable pageable);
}
