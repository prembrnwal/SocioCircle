package com.example.Community.Platform.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "follows", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"follower_id", "following_id"})
})
@Getter
@Setter
public class Follow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private Login_User follower; // The user who is following
    
    @ManyToOne
    @JoinColumn(name = "following_id", nullable = false)
    private Login_User following; // The user being followed
    
    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime followedAt;
}
