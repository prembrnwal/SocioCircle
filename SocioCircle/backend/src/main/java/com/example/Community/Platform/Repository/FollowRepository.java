package com.example.Community.Platform.Repository;

import com.example.Community.Platform.Entity.Follow;
import com.example.Community.Platform.Entity.Login_User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // Check if user A follows user B
    boolean existsByFollowerAndFollowing(Login_User follower, Login_User following);
    
    // Get follow relationship
    Optional<Follow> findByFollowerAndFollowing(Login_User follower, Login_User following);
    
    // Get all users that a user follows
    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user")
    List<Login_User> findFollowingByFollower(@Param("user") Login_User user);
    
    // Get all users that follow a user (followers)
    @Query("SELECT f.follower FROM Follow f WHERE f.following = :user")
    List<Login_User> findFollowersByFollowing(@Param("user") Login_User user);
    
    // Count how many users a user follows
    long countByFollower(Login_User follower);
    
    // Count how many followers a user has
    long countByFollowing(Login_User following);
}
