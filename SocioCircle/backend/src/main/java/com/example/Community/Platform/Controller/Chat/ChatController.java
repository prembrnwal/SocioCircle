package com.example.Community.Platform.Controller.Chat;

import com.example.Community.Platform.DTO.Chat.ChatMessageDTO;
import com.example.Community.Platform.Entity.Chat.ChatMessage;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.Chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    /**
     * When client sends message to /app/chat/{sessionId}
     * Broadcast to all subscribed to /topic/session/{sessionId}
     */
    @MessageMapping("/chat/{sessionId}")
    @SendTo("/topic/session/{sessionId}")
    public ChatMessageDTO broadcastMessage(
            @DestinationVariable Long sessionId,
            ChatMessageDTO messageDTO,
            @AuthenticationPrincipal Login_User currentUser) {
        
        // Save message to database
        ChatMessage savedMessage = chatService.saveMessage(sessionId, currentUser, messageDTO.getContent());
        
        // Create response DTO with sender info
        ChatMessageDTO response = new ChatMessageDTO();
        response.setId(savedMessage.getId());
        response.setSessionId(savedMessage.getSession().getId());
        response.setSenderEmail(savedMessage.getSender().getEmail());
        response.setSenderName(savedMessage.getSender().getName());
        response.setContent(savedMessage.getContent());
        response.setTimestamp(savedMessage.getTimestamp());
        
        return response;
    }
}
