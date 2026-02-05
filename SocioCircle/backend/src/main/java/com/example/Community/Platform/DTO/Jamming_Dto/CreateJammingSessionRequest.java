package com.example.Community.Platform.DTO.Jamming_Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class CreateJammingSessionRequest {

    private String title;
    private String description;
    private LocalDateTime startTime;
    private Integer durationMinutes;

}
