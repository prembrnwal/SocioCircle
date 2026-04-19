package com.example.SocioCircle.seed;

import com.example.SocioCircle.Entity.InterestGroup;
import com.example.SocioCircle.Entity.Jamming_Entity.JammingSession;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Entity.POST_WORK.Post;
import com.example.SocioCircle.Enum.SessionStatus;
import com.example.SocioCircle.Repository.InterestGroupRepository;
import com.example.SocioCircle.Repository.Jamming_Repo.JammingSessionRepository;
import com.example.SocioCircle.Repository.Post_repo.PostRepository;
import com.example.SocioCircle.Repository.repo_User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final repo_User userRepository;
    private final PostRepository postRepository;
    private final InterestGroupRepository interestGroupRepository;
    private final JammingSessionRepository jammingSessionRepository;

    public DataSeeder(repo_User userRepository, PostRepository postRepository, InterestGroupRepository interestGroupRepository, JammingSessionRepository jammingSessionRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.interestGroupRepository = interestGroupRepository;
        this.jammingSessionRepository = jammingSessionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding database with dummy data...");

            // 1. Create User
            Login_User user = new Login_User("premburnwal31@gmail.com", "Prem Burnwal", "password123", "I love coding!", "Technology, Music");
            user = userRepository.save(user);

            // 2. Create Post
            Post post = new Post();
            post.setUser(user);
            post.setCaption("Hello World! This is my first post on SocioCircle.");
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());
            postRepository.save(post);

            // 3. Create Interest Group
            InterestGroup group = new InterestGroup();
            group.setName("Spring Boot Enthusiasts");
            group.setDescription("A group for people who love Spring Boot.");
            group.setCreatedBy(user);
            group.setCreatedAt(LocalDateTime.now());
            group.setUpdatedAt(LocalDateTime.now());
            group = interestGroupRepository.save(group);

            // 4. Create Jamming Session
            JammingSession session = new JammingSession();
            session.setTitle("Let's Jam with Java 21");
            session.setDescription("Discussing new Java features.");
            session.setGroup(group);
            session.setCreatedBy(user);
            session.setStartTime(LocalDateTime.now().plusDays(1));
            session.setDurationMinutes(60);
            session.setStatus(SessionStatus.UPCOMING);
            jammingSessionRepository.save(session);

            System.out.println("Database seeding completed.");
        }
    }
}
