package com.example.Community.Platform.Repository.Post_repo;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.POST_WORK.Post;
import com.example.Community.Platform.Entity.POST_WORK.PostComment;
import com.example.Community.Platform.Entity.POST_WORK.PostLike;
import com.example.Community.Platform.Entity.POST_WORK.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {}

