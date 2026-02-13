package com.example.SocioCircle.DTO.Jamming_Dto;

import com.example.SocioCircle.Enum.SessionStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class JammingSessionResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private SessionStatus status;
    private Long groupId;
    private String createdBy;


}


