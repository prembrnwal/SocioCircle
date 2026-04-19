package com.example.SocioCircle.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private Long sessionId;
    private String userEmail;
    private String userName;
    private String content;
    private LocalDateTime timestamp;
}


