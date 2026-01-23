package com.example.Community.Platform.DTO.Jamming_Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ParticipantResponse {
    private String userId;  // Changed to String (email) to match Login_User
    private String username; // Changed to match Login_User.name
    private LocalDateTime joinedAt;
}
