package com.example.Community.Platform.Repository.Post_repo;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.POST_WORK.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUser(Login_User user);
    
    // Cursor-based pagination: Get posts after a specific ID (newest first)
    @Query("SELECT p FROM Post p WHERE p.id < :cursorId ORDER BY p.id DESC")
    List<Post> findByIdLessThanOrderByIdDesc(@Param("cursorId") Long cursorId, org.springframework.data.domain.Pageable pageable);
    
    // Cursor-based pagination: Get first page (newest first)
    @Query("SELECT p FROM Post p ORDER BY p.id DESC")
    List<Post> findAllOrderByIdDesc(org.springframework.data.domain.Pageable pageable);

    // Cursor-based pagination: Get user posts after a specific ID
    @Query("SELECT p FROM Post p WHERE p.user = :user AND p.id < :cursorId ORDER BY p.id DESC")
    List<Post> findByUserAndIdLessThanOrderByIdDesc(@Param("user") Login_User user, @Param("cursorId") Long cursorId, org.springframework.data.domain.Pageable pageable);
    
    // Cursor-based pagination: Get first page of user posts
    @Query("SELECT p FROM Post p WHERE p.user = :user ORDER BY p.id DESC")
    List<Post> findByUserOrderByIdDesc(@Param("user") Login_User user, org.springframework.data.domain.Pageable pageable);
    
    // Personalized feed: Get posts from followed users (cursor-based pagination)
    @Query("SELECT p FROM Post p WHERE p.user IN :followedUsers AND p.id < :cursorId ORDER BY p.id DESC")
    List<Post> findByUserInAndIdLessThanOrderByIdDesc(
            @Param("followedUsers") List<Login_User> followedUsers, 
            @Param("cursorId") Long cursorId, 
            org.springframework.data.domain.Pageable pageable);
    
    // Personalized feed: Get first page of posts from followed users
    @Query("SELECT p FROM Post p WHERE p.user IN :followedUsers ORDER BY p.id DESC")
    List<Post> findByUserInOrderByIdDesc(
            @Param("followedUsers") List<Login_User> followedUsers, 
            org.springframework.data.domain.Pageable pageable);
}

