package com.example.Community.Platform.Entity.POST_WORK;

import com.example.Community.Platform.Entity.Login_User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_comment")
@Getter
@Setter
public class PostComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Login_User user;

    @ManyToOne
    private Post post;

    @Column(columnDefinition = "TEXT")
    private String commentText;

    private LocalDateTime createdAt;


}
