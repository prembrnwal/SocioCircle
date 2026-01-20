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
import org.springframework.beans.factory.annotation.Autowired;
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
}

