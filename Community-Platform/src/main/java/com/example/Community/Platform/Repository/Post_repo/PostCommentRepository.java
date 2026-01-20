package com.example.Community.Platform.Repository.Post_repo;

import com.example.Community.Platform.Entity.POST_WORK.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostId(Long postId);
}
