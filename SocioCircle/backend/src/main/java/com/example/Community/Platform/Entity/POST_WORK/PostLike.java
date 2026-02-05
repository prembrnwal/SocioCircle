package com.example.Community.Platform.Entity.POST_WORK;

import com.example.Community.Platform.Entity.Login_User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "post_like")
@Getter
@Setter
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Login_User user;

    @ManyToOne
    private Post post;

}

