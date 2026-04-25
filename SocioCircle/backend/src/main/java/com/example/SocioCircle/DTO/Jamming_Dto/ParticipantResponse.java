package com.example.SocioCircle.DTO.Jamming_Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ParticipantResponse {
    private Long id;
    private Long sessionId;
    private String userEmail;
    private String userName;
    private String userProfilePicture;
    private LocalDateTime joinedAt;
}


