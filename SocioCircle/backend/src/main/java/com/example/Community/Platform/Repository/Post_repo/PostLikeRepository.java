package com.example.Community.Platform.Repository.Post_repo;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.POST_WORK.Post;
import com.example.Community.Platform.Entity.POST_WORK.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByPostAndUser(Post post, Login_User user);
    void deleteByPostAndUser(Post post, Login_User user);
    long countByPost(Post post);
}

