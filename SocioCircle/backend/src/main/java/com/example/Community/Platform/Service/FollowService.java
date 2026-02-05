package com.example.Community.Platform.Service;

import com.example.Community.Platform.DTO.FollowStats;
import com.example.Community.Platform.DTO.UserInfo;
import com.example.Community.Platform.Entity.Follow;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Repository.FollowRepository;
import com.example.Community.Platform.Repository.repo_User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {
    
    @Autowired
    private FollowRepository followRepo;
    
    @Autowired
    private repo_User userRepo;
    
    /**
     * Follow a user
     */
    public void followUser(Login_User follower, String followingEmail) {
        // Check if trying to follow self
        if (follower.getEmail().equals(followingEmail)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        
        // Get user to follow
        Login_User following = userRepo.findById(followingEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if already following
        if (followRepo.existsByFollowerAndFollowing(follower, following)) {
            throw new IllegalStateException("Already following this user");
        }
        
        // Create follow relationship
        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepo.save(follow);
    }
    
    /**
     * Unfollow a user
     */
    public void unfollowUser(Login_User follower, String followingEmail) {
        Login_User following = userRepo.findById(followingEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Follow follow = followRepo.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new IllegalStateException("Not following this user"));
        
        followRepo.delete(follow);
    }
    
    /**
     * Get list of users that current user follows
     */
    public List<UserInfo> getFollowing(Login_User user) {
        List<Login_User> following = followRepo.findFollowingByFollower(user);
        return following.stream()
                .map(this::mapToUserInfo)
                .collect(Collectors.toList());
    }
    
    /**
     * Get list of users that follow current user (followers)
     */
    public List<UserInfo> getFollowers(Login_User user) {
        List<Login_User> followers = followRepo.findFollowersByFollowing(user);
        return followers.stream()
                .map(this::mapToUserInfo)
                .collect(Collectors.toList());
    }
    
    /**
     * Get followers of a specific user
     */
    public List<UserInfo> getFollowersByEmail(String email) {
        Login_User user = userRepo.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getFollowers(user);
    }
    
    /**
     * Get following list of a specific user
     */
    public List<UserInfo> getFollowingByEmail(String email) {
        Login_User user = userRepo.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getFollowing(user);
    }
    
    /**
     * Check if current user follows another user
     */
    public boolean isFollowing(Login_User follower, String followingEmail) {
        Login_User following = userRepo.findById(followingEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepo.existsByFollowerAndFollowing(follower, following);
    }
    
    /**
     * Get follow statistics for a user
     */
    public FollowStats getFollowStats(String email, Login_User currentUser) {
        Login_User user = userRepo.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long followersCount = followRepo.countByFollowing(user);
        long followingCount = followRepo.countByFollower(user);
        boolean isFollowing = currentUser != null && 
                followRepo.existsByFollowerAndFollowing(currentUser, user);
        
        return new FollowStats(followersCount, followingCount, isFollowing);
    }
    
    /**
     * Get list of users that current user follows (for feed queries)
     */
    public List<Login_User> getFollowingUsers(Login_User user) {
        return followRepo.findFollowingByFollower(user);
    }
    
    private UserInfo mapToUserInfo(Login_User user) {
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(user.getEmail());
        userInfo.setName(user.getName());
        userInfo.setBio(user.getBio());
        userInfo.setInterests(user.getInterests());
        userInfo.setProfilePicture(user.getProfilePicture());
        return userInfo;
    }
}
