package com.example.SocioCircle.Repository.Post_repo;

import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Entity.POST_WORK.Post;
import com.example.SocioCircle.Entity.POST_WORK.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    boolean existsByPostAndUser(Post post, Login_User user);
    void deleteByPostAndUser(Post post, Login_User user);
    long countByPost(Post post);
}



