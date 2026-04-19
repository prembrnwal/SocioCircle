package com.example.SocioCircle.Controller.Chat;

import com.example.SocioCircle.DTO.Chat.ChatMessageDTO;
import com.example.SocioCircle.Entity.Chat.ChatMessage;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Service.Chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import java.security.Principal;
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
            Principal principal) {
        
        String userEmail = null;
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            Object authPrincipal = auth.getPrincipal();
            if (authPrincipal instanceof Login_User u) {
                userEmail = u.getEmail();
            } else if (authPrincipal instanceof String s) {
                userEmail = s;
            }
        }
        
        if (userEmail == null) {
            throw new RuntimeException("Unauthorized: Unable to resolve user from WebSocket connection");
        }
        
        // Save message to database
        ChatMessage savedMessage = chatService.saveMessage(sessionId, userEmail, messageDTO.getContent());
        
        // Create response DTO with sender info
        ChatMessageDTO response = new ChatMessageDTO();
        response.setId(savedMessage.getId());
        response.setSessionId(savedMessage.getSession().getId());
        response.setUserEmail(savedMessage.getSender().getEmail());
        response.setUserName(savedMessage.getSender().getName());
        response.setContent(savedMessage.getContent());
        response.setTimestamp(savedMessage.getTimestamp());
        
        return response;
    }
}


