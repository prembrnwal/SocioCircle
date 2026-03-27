package com.example.SocioCircle.DTO.Jamming_Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
@Getter
@Setter
public class CreateJammingSessionRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    @Future(message = "Start time must be in the future")
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "Duration is required")
    @Min(value = 5, message = "Session must be at least 5 minutes")
    private Integer durationMinutes;
}


