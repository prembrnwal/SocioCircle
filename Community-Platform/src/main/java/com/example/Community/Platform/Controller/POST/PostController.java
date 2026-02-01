package com.example.Community.Platform.Controller.POST;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.POST_WORK.Post;
import com.example.Community.Platform.Entity.POST_WORK.PostComment;
import com.example.Community.Platform.Repository.repo_User;
import com.example.Community.Platform.Service.Post_Service.PostService;
import com.example.Community.Platform.DTO.Pagging.CursorPageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    
    @Autowired
    private repo_User userRepo;

    // CREATE POST
    @PostMapping
    public ResponseEntity<String> createPost(
            @RequestParam String caption,
            @RequestParam MultipartFile[] files,
            @AuthenticationPrincipal Login_User user) throws IOException {
        postService.createPost(user, caption, files);
        return ResponseEntity.ok("Post created");
    }

    // GET ALL POSTS (FEED) - with cursor-based pagination
    @GetMapping("/feed")
    public ResponseEntity<CursorPageResponse<Post>> getFeed(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getFeed(cursor, size));
    }

    // GET PERSONALIZED FEED (Posts from followed users) - with cursor-based pagination
    @GetMapping("/feed/following")
    public ResponseEntity<CursorPageResponse<Post>> getPersonalizedFeed(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Login_User user) {
        return ResponseEntity.ok(postService.getPersonalizedFeed(user, cursor, size));
    }

    // GET POST BY ID
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    // GET POSTS BY USER - with cursor-based pagination
    @GetMapping("/user/{userEmail}")
    public ResponseEntity<CursorPageResponse<Post>> getPostsByUser(@PathVariable String userEmail,
                                                                     @RequestParam(required = false) Long cursor,
                                                                     @RequestParam(defaultValue = "10") int size) {
        Login_User user = userRepo.findById(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(postService.getPostsByUser(user, cursor, size));
    }

    // GET POSTS BY CURRENT USER
    @GetMapping("/my-posts")
    public ResponseEntity<List<Post>> getMyPosts(@AuthenticationPrincipal Login_User user) {
        return ResponseEntity.ok(postService.getPostsByUser(user));
    }

    // UPDATE POST
    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable Long postId,
                                           @RequestParam String caption,
                                           @AuthenticationPrincipal Login_User user) {
        Post updatedPost = postService.updatePost(postId, user, caption);
        return ResponseEntity.ok(updatedPost);
    }

    // DELETE POST
    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long postId,
                                             @AuthenticationPrincipal Login_User user) {
        postService.deletePost(postId, user);
        return ResponseEntity.ok("Post deleted successfully");
    }

    // LIKE POST
    @PostMapping("/{postId}/like")
    public ResponseEntity<String> like(@PathVariable Long postId,
                                       @AuthenticationPrincipal Login_User user) {
        postService.likePost(user, postId);
        return ResponseEntity.ok("Liked");
    }

    // UNLIKE POST
    @PostMapping("/{postId}/unlike")
    public ResponseEntity<String> unlike(@PathVariable Long postId,
                                         @AuthenticationPrincipal Login_User user) {
        postService.unlikePost(user, postId);
        return ResponseEntity.ok("Unliked");
    }

    // GET LIKE COUNT
    @GetMapping("/{postId}/likes")
    public ResponseEntity<Map<String, Object>> getLikeInfo(@PathVariable Long postId,
                                                           @AuthenticationPrincipal Login_User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("likeCount", postService.getLikeCount(postId));
        response.put("hasLiked", postService.hasUserLiked(user, postId));
        return ResponseEntity.ok(response);
    }

    // ADD COMMENT
    @PostMapping("/{postId}/comment")
    public ResponseEntity<String> comment(@PathVariable Long postId,
                                          @RequestBody String comment,
                                          @AuthenticationPrincipal Login_User user) {
        postService.addComment(user, postId, comment);
        return ResponseEntity.ok("Comment added");
    }

    // GET COMMENTS
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<PostComment>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getComments(postId));
    }

    // GET COMMENT COUNT
    @GetMapping("/{postId}/comments/count")
    public ResponseEntity<Map<String, Long>> getCommentCount(@PathVariable Long postId) {
        Map<String, Long> response = new HashMap<>();
        response.put("commentCount", postService.getCommentCount(postId));
        return ResponseEntity.ok(response);
    }

    // UPDATE COMMENT
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<PostComment> updateComment(@PathVariable Long postId,
                                                     @PathVariable Long commentId,
                                                     @RequestBody String newCommentText,
                                                     @AuthenticationPrincipal Login_User user) {
        PostComment updatedComment = postService.updateComment(commentId, user, newCommentText);
        return ResponseEntity.ok(updatedComment);
    }

    // DELETE COMMENT
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long postId,
                                                @PathVariable Long commentId,
                                                @AuthenticationPrincipal Login_User user) {
        postService.deleteComment(commentId, user);
        return ResponseEntity.ok("Comment deleted successfully");
    }

}
