package com.example.Community.Platform.Service.Post_Service;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.POST_WORK.Post;
import com.example.Community.Platform.Entity.POST_WORK.PostComment;
import com.example.Community.Platform.Entity.POST_WORK.PostLike;
import com.example.Community.Platform.Entity.POST_WORK.PostMedia;
import com.example.Community.Platform.Repository.Post_repo.PostCommentRepository;
import com.example.Community.Platform.Repository.Post_repo.PostLikeRepository;
import com.example.Community.Platform.Repository.Post_repo.PostMediaRepository;
import com.example.Community.Platform.Repository.Post_repo.PostRepository;
import com.example.Community.Platform.DTO.Pagging.CursorPageResponse;
import com.example.Community.Platform.Service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepo;
    @Autowired private PostMediaRepository mediaRepo;
    @Autowired private PostLikeRepository likeRepo;
    @Autowired private PostCommentRepository commentRepo;
    @Autowired private FollowService followService;

    private final String UPLOAD_DIR = "uploads/";

    // CREATE POST
    public Post createPost(Login_User user, String caption, MultipartFile[] files) throws IOException {
        Post post = new Post();
        post.setUser(user);
        post.setCaption(caption);
        post.setCreatedAt(LocalDateTime.now());

        post = postRepo.save(post);

        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            PostMedia media = new PostMedia();
            media.setMediaUrl("/uploads/" + fileName);
            media.setPost(post);
            mediaRepo.save(media);
        }
        return post;
    }

    // LIKE POST
    public void likePost(Login_User user, Long postId) {
        Post post = postRepo.findById(postId).orElseThrow();
        if (!likeRepo.existsByPostAndUser(post, user)) {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            likeRepo.save(like);
        }
    }

    // UNLIKE POST
    public void unlikePost(Login_User user, Long postId) {
        Post post = postRepo.findById(postId).orElseThrow();
        likeRepo.deleteByPostAndUser(post, user);
    }

    // COMMENT
    public void addComment(Login_User user, Long postId, String commentText) {
        Post post = postRepo.findById(postId).orElseThrow();
        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setCommentText(commentText);
        comment.setCreatedAt(LocalDateTime.now());
        commentRepo.save(comment);
    }

    public List<PostComment> getComments(Long postId) {
        return commentRepo.findByPostId(postId);
    }

    // UPDATE COMMENT
    public PostComment updateComment(Long commentId, Login_User user, String newCommentText) {
        PostComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));
        
        // Check if user is the owner
        if (!comment.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("You can only update your own comments");
        }
        
        comment.setCommentText(newCommentText);
        return commentRepo.save(comment);
    }

    // DELETE COMMENT
    public void deleteComment(Long commentId, Login_User user) {
        PostComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));
        
        // Check if user is the owner
        if (!comment.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        commentRepo.delete(comment);
    }

    // GET ALL POSTS (FEED) - with cursor-based pagination
    public CursorPageResponse<Post> getFeed(Long cursor, int size) {
        Pageable pageable = PageRequest.of(0, size + 1); // Fetch one extra to check if there's more
        
        List<Post> posts;
        if (cursor == null) {
            // First page
            posts = postRepo.findAllOrderByIdDesc(pageable);
        } else {
            // Subsequent pages
            posts = postRepo.findByIdLessThanOrderByIdDesc(cursor, pageable);
        }
        
        boolean hasNext = posts.size() > size;
        if (hasNext) {
            posts = posts.subList(0, size); // Remove the extra item
        }
        
        Long nextCursor = posts.isEmpty() ? null : posts.get(posts.size() - 1).getId();
        
        return new CursorPageResponse<>(posts, nextCursor, hasNext, posts.size());
    }

    // GET PERSONALIZED FEED (Posts from followed users) - with cursor-based pagination
    public CursorPageResponse<Post> getPersonalizedFeed(Login_User user, Long cursor, int size) {
        // Get list of users that current user follows
        List<Login_User> followedUsers = followService.getFollowingUsers(user);
        
        // If user doesn't follow anyone, return empty feed
        if (followedUsers.isEmpty()) {
            return new CursorPageResponse<>(List.of(), null, false, 0);
        }
        
        Pageable pageable = PageRequest.of(0, size + 1); // Fetch one extra to check if there's more
        
        List<Post> posts;
        if (cursor == null) {
            // First page
            posts = postRepo.findByUserInOrderByIdDesc(followedUsers, pageable);
        } else {
            // Subsequent pages
            posts = postRepo.findByUserInAndIdLessThanOrderByIdDesc(followedUsers, cursor, pageable);
        }
        
        boolean hasNext = posts.size() > size;
        if (hasNext) {
            posts = posts.subList(0, size); // Remove the extra item
        }
        
        Long nextCursor = posts.isEmpty() ? null : posts.get(posts.size() - 1).getId();
        
        return new CursorPageResponse<>(posts, nextCursor, hasNext, posts.size());
    }

    // GET POST BY ID
    public Post getPostById(Long postId) {
        return postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
    }

    // GET POSTS BY USER
    public List<Post> getPostsByUser(Login_User user) {
        return postRepo.findByUser(user);
    }

    // GET POSTS BY USER with cursor-based pagination
    public CursorPageResponse<Post> getPostsByUser(Login_User user, Long cursor, int size) {
        Pageable pageable = PageRequest.of(0, size + 1); // Fetch one extra to check if there's more
        
        List<Post> posts;
        if (cursor == null) {
            // First page
            posts = postRepo.findByUserOrderByIdDesc(user, pageable);
        } else {
            // Subsequent pages
            posts = postRepo.findByUserAndIdLessThanOrderByIdDesc(user, cursor, pageable);
        }
        
        boolean hasNext = posts.size() > size;
        if (hasNext) {
            posts = posts.subList(0, size); // Remove the extra item
        }
        
        Long nextCursor = posts.isEmpty() ? null : posts.get(posts.size() - 1).getId();
        
        return new CursorPageResponse<>(posts, nextCursor, hasNext, posts.size());
    }

    // UPDATE POST
    public Post updatePost(Long postId, Login_User user, String newCaption) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        // Check if user is the owner
        if (!post.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("You can only update your own posts");
        }
        
        post.setCaption(newCaption);
        post.setUpdatedAt(LocalDateTime.now());
        return postRepo.save(post);
    }

    // DELETE POST
    public void deletePost(Long postId, Login_User user) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        // Check if user is the owner
        if (!post.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("You can only delete your own posts");
        }
        
        postRepo.delete(post);
    }

    // GET LIKE COUNT
    public Long getLikeCount(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        return likeRepo.countByPost(post);
    }

    // GET COMMENT COUNT
    public Long getCommentCount(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        return commentRepo.countByPost(post);
    }

    // CHECK IF USER LIKED POST
    public boolean hasUserLiked(Login_User user, Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        return likeRepo.existsByPostAndUser(post, user);
    }



}

