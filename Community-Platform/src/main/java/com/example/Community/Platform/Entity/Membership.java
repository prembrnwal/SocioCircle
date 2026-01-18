package com.example.Community.Platform.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "membership")
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Login_User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private InterestGroup group;

    private LocalDateTime joinedAt;


}
