package in.myratech.scheduler.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import java.util.UUID;
import jakarta.persistence.PrePersist;

@Data
@Entity
public class JobDetails {
    @Id
    private UUID id;
    private String jobName;
    private String jobGroup;
    private String cronExpression;
    private String parameters;
    private boolean active;

    private String url;
    private String method;
    private String requestBody;
    private String headers;

    @Column(nullable = false)
    private boolean deleted = false;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }
}
