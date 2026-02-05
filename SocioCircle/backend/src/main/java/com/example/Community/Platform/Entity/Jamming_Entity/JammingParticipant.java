package com.example.Community.Platform.Entity.Jamming_Entity;

import com.example.Community.Platform.Entity.Login_User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "jamming_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "user_id"})
)
@Getter
@Setter
public class JammingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private JammingSession session;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Login_User user;

    @CreationTimestamp
    private LocalDateTime joinedAt;

    private LocalDateTime leftAt;

}
