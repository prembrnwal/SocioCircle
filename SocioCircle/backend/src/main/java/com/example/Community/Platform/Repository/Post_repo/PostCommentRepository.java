package com.example.Community.Platform.Repository.Post_repo;

import com.example.Community.Platform.Entity.POST_WORK.Post;
import com.example.Community.Platform.Entity.POST_WORK.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostId(Long postId);
    long countByPost(Post post);
}
