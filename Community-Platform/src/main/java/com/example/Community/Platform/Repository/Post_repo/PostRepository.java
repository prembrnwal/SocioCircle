package com.example.Community.Platform.Repository.Post_repo;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.POST_WORK.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUser(Login_User user);
    Page<Post> findByUser(Login_User user, Pageable pageable);
}

