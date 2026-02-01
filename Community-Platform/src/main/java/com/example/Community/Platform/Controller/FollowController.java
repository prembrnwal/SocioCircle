package com.example.Community.Platform.Controller;

import com.example.Community.Platform.DTO.FollowStats;
import com.example.Community.Platform.DTO.UserInfo;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class FollowController {
    
    @Autowired
    private FollowService followService;
    
    /**
     * Follow a user
     * POST /api/users/{email}/follow
     */
    @PostMapping("/{email}/follow")
    public ResponseEntity<String> followUser(
            @PathVariable String email,
            @AuthenticationPrincipal Login_User currentUser) {
        followService.followUser(currentUser, email);
        return ResponseEntity.ok("Successfully followed user");
    }
    
    /**
     * Unfollow a user
     * POST /api/users/{email}/unfollow
     */
    @PostMapping("/{email}/unfollow")
    public ResponseEntity<String> unfollowUser(
            @PathVariable String email,
            @AuthenticationPrincipal Login_User currentUser) {
        followService.unfollowUser(currentUser, email);
        return ResponseEntity.ok("Successfully unfollowed user");
    }
    
    /**
     * Get list of users that current user follows
     * GET /api/users/me/following
     */
    @GetMapping("/me/following")
    public ResponseEntity<List<UserInfo>> getFollowing(
            @AuthenticationPrincipal Login_User currentUser) {
        List<UserInfo> following = followService.getFollowing(currentUser);
        return ResponseEntity.ok(following);
    }
    
    /**
     * Get list of users that follow current user (followers)
     * GET /api/users/me/followers
     */
    @GetMapping("/me/followers")
    public ResponseEntity<List<UserInfo>> getFollowers(
            @AuthenticationPrincipal Login_User currentUser) {
        List<UserInfo> followers = followService.getFollowers(currentUser);
        return ResponseEntity.ok(followers);
    }
    
    /**
     * Get followers of a specific user
     * GET /api/users/{email}/followers
     */
    @GetMapping("/{email}/followers")
    public ResponseEntity<List<UserInfo>> getFollowersByEmail(@PathVariable String email) {
        List<UserInfo> followers = followService.getFollowersByEmail(email);
        return ResponseEntity.ok(followers);
    }
    
    /**
     * Get following list of a specific user
     * GET /api/users/{email}/following
     */
    @GetMapping("/{email}/following")
    public ResponseEntity<List<UserInfo>> getFollowingByEmail(@PathVariable String email) {
        List<UserInfo> following = followService.getFollowingByEmail(email);
        return ResponseEntity.ok(following);
    }
    
    /**
     * Check if current user follows another user
     * GET /api/users/{email}/is-following
     */
    @GetMapping("/{email}/is-following")
    public ResponseEntity<Boolean> isFollowing(
            @PathVariable String email,
            @AuthenticationPrincipal Login_User currentUser) {
        boolean isFollowing = followService.isFollowing(currentUser, email);
        return ResponseEntity.ok(isFollowing);
    }
    
    /**
     * Get follow statistics (followers count, following count, isFollowing)
     * GET /api/users/{email}/follow-stats
     */
    @GetMapping("/{email}/follow-stats")
    public ResponseEntity<FollowStats> getFollowStats(
            @PathVariable String email,
            @AuthenticationPrincipal Login_User currentUser) {
        FollowStats stats = followService.getFollowStats(email, currentUser);
        return ResponseEntity.ok(stats);
    }
}
