package com.example.Community.Platform.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class Login_User {
//
//        @Id
//        @GeneratedValue(strategy = GenerationType.IDENTITY)
//        private Long id;
//
//        private String name;
//
//        @Column(unique = true, nullable = false)
//        private String email;
//
//        private String password;
//
//        private String bio;
//
//        private String interests;
//
//        private LocalDateTime createdAt;
//        private LocalDateTime updatedAt;




        @Id
        @Column(name = "email")
        private String email;

        @Column(name = "name")
        private String name;

        @Column(name = "password")
        private String password;

        @Column(name = "bio")
        private String bio;

        @Column(name = "interests")
        private String interests;

        @Column(name = "profile_picture")
        private String profilePicture;

        public Login_User(String email, String name, String password) {
                this.email = email;
                this.name = name;
                this.password = password;
        }

        public Login_User(String email, String name, String password, String bio, String interests) {
                this.email = email;
                this.name = name;
                this.password = password;
                this.bio = bio;
                this.interests = interests;
        }
        public Login_User(){

        }


}
