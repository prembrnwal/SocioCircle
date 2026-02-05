//package com.example.Community.Platform.Service;
//
//import com.example.Community.Platform.DTO.Login_dto;
//import com.example.Community.Platform.Entity.Login_User;
//import com.example.Community.Platform.Repository.repo_User;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.util.Optional;
//
//@Service
//public class serviceUser {
//
//    @Autowired
//    private repo_User repo;
//
//    @Autowired
//    private BCryptPasswordEncoder encoder;
//
//    public Login_User addUser(Login_User user){
//        user.setPassword(encoder.encode(user.getPassword()));
//        return repo.save(user);
//    }
//
//    public Boolean loginUser(Login_dto LoginRequest){
//        Optional<Login_User> user = repo.findById(LoginRequest.getUserId());
//        if (!user.isPresent()){
//            throw new BadCredentialsException("Invalid email or password");
//        }
//        Login_User user1 = user.get();
//
//
////        if(!user1.getPassword().equals(encoder.encode(LoginRequest.getPassword()))) {
////            return false;
////        }
//        if (!encoder.matches(LoginRequest.getPassword(), user1.getPassword())) {
//            throw new BadCredentialsException("Invalid email or password");
//        }
//
//        return true;
//    }
//}


package com.example.Community.Platform.Service;

import com.example.Community.Platform.DTO.ChangePasswordRequest;
import com.example.Community.Platform.DTO.Login_dto;
import com.example.Community.Platform.DTO.LoginResponse;
import com.example.Community.Platform.DTO.UpdateProfileRequest;
import com.example.Community.Platform.DTO.UserInfo;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Repository.repo_User;
import com.example.Community.Platform.Security.JwtTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

@Service
public class serviceUser {

    @Autowired
    private repo_User repo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtTokenService jwtTokenService;

    private final String UPLOAD_DIR = "uploads/profile-pictures/";

    public Login_User addUser(Login_User user){
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public LoginResponse loginUser(Login_dto LoginRequest){
        Optional<Login_User> user = repo.findById(LoginRequest.getUserId());
        if (!user.isPresent()){
            throw new BadCredentialsException("Invalid email or password");
        }
        Login_User user1 = user.get();

        if (!encoder.matches(LoginRequest.getPassword(), user1.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtTokenService.generateToken(user1.getEmail());

        // Create UserInfo object
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(user1.getEmail());
        userInfo.setName(user1.getName());
        userInfo.setBio(user1.getBio());
        userInfo.setInterests(user1.getInterests());
        userInfo.setProfilePicture(user1.getProfilePicture());

        // Create and return LoginResponse
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userInfo);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtTokenService.getExpiration());

        return response;
    }

    // Get current user profile
    public UserInfo getCurrentUser(Login_User user) {
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(user.getEmail());
        userInfo.setName(user.getName());
        userInfo.setBio(user.getBio());
        userInfo.setInterests(user.getInterests());
        userInfo.setProfilePicture(user.getProfilePicture());
        return userInfo;
    }

    // Get user profile by email
    public UserInfo getUserProfile(String email) {
        Login_User user = repo.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(user.getEmail());
        userInfo.setName(user.getName());
        userInfo.setBio(user.getBio());
        userInfo.setInterests(user.getInterests());
        userInfo.setProfilePicture(user.getProfilePicture());
        return userInfo;
    }

    // Update user profile
    public UserInfo updateProfile(Login_User user, UpdateProfileRequest request) {
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }
        
        user = repo.save(user);
        
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(user.getEmail());
        userInfo.setName(user.getName());
        userInfo.setBio(user.getBio());
        userInfo.setInterests(user.getInterests());
        userInfo.setProfilePicture(user.getProfilePicture());
        return userInfo;
    }

    // Change password
    public void changePassword(Login_User user, ChangePasswordRequest request) {
        // Verify current password
        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        
        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }
        
        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        
        // Update password
        user.setPassword(encoder.encode(request.getNewPassword()));
        repo.save(user);
    }

    // Upload profile picture
    public String uploadProfilePicture(Login_User user, MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Delete old profile picture if exists
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            try {
                Path oldPicturePath = Paths.get(user.getProfilePicture());
                if (Files.exists(oldPicturePath)) {
                    Files.delete(oldPicturePath);
                }
            } catch (Exception e) {
                // Log error but continue
            }
        }
        
        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        
        // Save file
        Files.write(filePath, file.getBytes());
        
        // Update user profile picture
        String relativePath = UPLOAD_DIR + fileName;
        user.setProfilePicture(relativePath);
        repo.save(user);
        
        return relativePath;
    }
}