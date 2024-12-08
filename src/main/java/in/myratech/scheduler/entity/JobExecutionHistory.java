package in.myratech.scheduler.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Data
@Table(name = "job_execution_history")
public class JobExecutionHistory {
    @Id
    private UUID uuid;

    private UUID jobId;

    private String triggerName;

    @Column(name = "start_time")
    private Timestamp startTime;

    @Column(name = "end_time")
    private Timestamp endTime;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    public void ensureId() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
    }
}
