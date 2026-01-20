package com.example.Community.Platform.Entity.POST_WORK;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "post_media")
@Getter
@Setter
public class PostMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mediaUrl; // URL or path to file in storage

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;


}
