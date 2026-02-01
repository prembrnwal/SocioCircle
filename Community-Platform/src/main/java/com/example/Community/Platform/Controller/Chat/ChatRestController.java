package com.example.Community.Platform.Controller.Chat;

import com.example.Community.Platform.DTO.Chat.ChatMessageDTO;
import com.example.Community.Platform.DTO.Pagging.TimeCursorPageResponse;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.Chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {
    
    @Autowired
    private ChatService chatService;
    
    /**
     * Get message history for a session (cursor-based pagination)
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<TimeCursorPageResponse<ChatMessageDTO>> getMessageHistory(
            @PathVariable Long sessionId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime cursor,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal Login_User currentUser) {
        
        return ResponseEntity.ok(chatService.getMessageHistory(sessionId, cursor, limit));
    }
}
