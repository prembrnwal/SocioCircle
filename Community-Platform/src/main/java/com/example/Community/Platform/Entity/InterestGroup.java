package com.example.Community.Platform.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interest_group")
public class InterestGroup {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String name;

        private String description;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "created_by")
        private Login_User createdBy;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;


}
