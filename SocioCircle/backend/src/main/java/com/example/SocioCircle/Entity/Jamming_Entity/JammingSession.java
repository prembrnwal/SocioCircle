package com.example.SocioCircle.Entity.Jamming_Entity;

import com.example.SocioCircle.Entity.InterestGroup;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Enum.SessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "jamming_sessions")
@Getter
@Setter
public class JammingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private InterestGroup group;

    private String title;

    private String description;

    private LocalDateTime startTime;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Login_User createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;


}


