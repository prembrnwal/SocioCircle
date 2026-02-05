package com.example.Community.Platform.Controller;

import com.example.Community.Platform.DTO.ChangePasswordRequest;
import com.example.Community.Platform.DTO.UpdateProfileRequest;
import com.example.Community.Platform.DTO.UserInfo;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.serviceUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private serviceUser userService;

    /**
     * Get current user profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfo> getCurrentUser(@AuthenticationPrincipal Login_User currentUser) {
        UserInfo userInfo = userService.getCurrentUser(currentUser);
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Get user profile by email
     * GET /api/users/{email}
     */
    @GetMapping("/{email}")
    public ResponseEntity<UserInfo> getUserProfile(@PathVariable String email) {
        UserInfo userInfo = userService.getUserProfile(email);
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Update user profile
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserInfo> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal Login_User currentUser) {
        UserInfo userInfo = userService.updateProfile(currentUser, request);
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Change password
     * PUT /api/users/password
     */
    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal Login_User currentUser) {
        userService.changePassword(currentUser, request);
        return ResponseEntity.ok("Password changed successfully");
    }

    /**
     * Upload profile picture
     * POST /api/users/profile-picture
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<String> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Login_User currentUser) {
        try {
            String filePath = userService.uploadProfilePicture(currentUser, file);
            return ResponseEntity.ok(filePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload profile picture: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}
