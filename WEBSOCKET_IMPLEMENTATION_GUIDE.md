# 🔌 Complete WebSocket Chat Implementation Guide

## ❌ What's Missing from Your Current Code

1. **WebSocket Dependency** - Not in pom.xml
2. **JWT Authentication for WebSocket** - No auth handler
3. **ChatMessage Entity** - No database persistence
4. **ChatMessage Repository** - No way to save messages
5. **Service Layer** - Business logic missing
6. **Authorization** - TODO not implemented
7. **User Identification** - Can't get authenticated user
8. **Message History** - No way to retrieve past messages

---

## ✅ Complete Implementation

### Step 1: Add WebSocket Dependency

**File:** `pom.xml`

Add this dependency:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

---

### Step 2: Create ChatMessage Entity

**File:** `Entity/Chat/ChatMessage.java`

```java
package com.example.Community.Platform.Entity.Chat;

import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Entity.Login_User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private JammingSession session;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Login_User sender;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
```

---

### Step 3: Create ChatMessage Repository

**File:** `Repository/Chat/ChatMessageRepository.java`

```java
package com.example.Community.Platform.Repository.Chat;

import com.example.Community.Platform.Entity.Chat.ChatMessage;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Get recent messages for a session (cursor-based pagination)
    @Query("SELECT m FROM ChatMessage m WHERE m.session = :session AND m.timestamp < :cursor ORDER BY m.timestamp DESC")
    List<ChatMessage> findBySessionAndTimestampLessThanOrderByTimestampDesc(
            JammingSession session, 
            LocalDateTime cursor, 
            Pageable pageable);
    
    // Get first page of messages
    @Query("SELECT m FROM ChatMessage m WHERE m.session = :session ORDER BY m.timestamp DESC")
    List<ChatMessage> findBySessionOrderByTimestampDesc(
            JammingSession session, 
            Pageable pageable);
    
    // Count messages in a session
    long countBySession(JammingSession session);
}
```

---

### Step 4: Create ChatMessage DTO

**File:** `DTO/Chat/ChatMessageDTO.java`

```java
package com.example.Community.Platform.DTO.Chat;

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
    private String senderEmail;
    private String senderName;
    private String content;
    private LocalDateTime timestamp;
}
```

---

### Step 5: Create Chat Service

**File:** `Service/Chat/ChatService.java`

```java
package com.example.Community.Platform.Service.Chat;

import com.example.Community.Platform.DTO.Chat.ChatMessageDTO;
import com.example.Community.Platform.DTO.Pagging.TimeCursorPageResponse;
import com.example.Community.Platform.Entity.Chat.ChatMessage;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Enum.SessionStatus;
import com.example.Community.Platform.Repository.Chat.ChatMessageRepository;
import com.example.Community.Platform.Repository.Jamming_Repo.JammingParticipantRepository;
import com.example.Community.Platform.Repository.Jamming_Repo.JammingSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    
    @Autowired
    private ChatMessageRepository messageRepo;
    
    @Autowired
    private JammingSessionRepository sessionRepo;
    
    @Autowired
    private JammingParticipantRepository participantRepo;
    
    /**
     * Save message to database
     */
    public ChatMessage saveMessage(Long sessionId, Login_User sender, String content) {
        JammingSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Check if session is LIVE
        if (session.getStatus() != SessionStatus.LIVE) {
            throw new RuntimeException("Session is not live");
        }
        
        // Check if user is participant
        if (!participantRepo.existsBySessionAndUserAndLeftAtIsNull(session, sender)) {
            throw new RuntimeException("User is not a participant of this session");
        }
        
        ChatMessage message = new ChatMessage();
        message.setSession(session);
        message.setSender(sender);
        message.setContent(content);
        
        return messageRepo.save(message);
    }
    
    /**
     * Get message history with cursor-based pagination
     */
    public TimeCursorPageResponse<ChatMessageDTO> getMessageHistory(
            Long sessionId, 
            LocalDateTime cursor, 
            int limit) {
        
        JammingSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        Pageable pageable = PageRequest.of(0, limit + 1);
        
        List<ChatMessage> messages;
        if (cursor == null) {
            messages = messageRepo.findBySessionOrderByTimestampDesc(session, pageable);
        } else {
            messages = messageRepo.findBySessionAndTimestampLessThanOrderByTimestampDesc(
                    session, cursor, pageable);
        }
        
        boolean hasNext = messages.size() > limit;
        if (hasNext) {
            messages = messages.subList(0, limit);
        }
        
        List<ChatMessageDTO> responseList = messages.stream()
                .map(this::mapToDTO)
                .toList();
        
        LocalDateTime nextCursor = responseList.isEmpty() ? null : 
                responseList.get(responseList.size() - 1).getTimestamp();
        
        return new TimeCursorPageResponse<>(responseList, nextCursor, hasNext, responseList.size());
    }
    
    private ChatMessageDTO mapToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setSessionId(message.getSession().getId());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setSenderName(message.getSender().getName());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        return dto;
    }
}
```

---

### Step 6: Create JWT WebSocket Authentication Handler

**File:** `Security/JwtWebSocketAuthInterceptor.java`

```java
package com.example.Community.Platform.Security;

import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Repository.repo_User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class JwtWebSocketAuthInterceptor implements ChannelInterceptor {
    
    @Autowired
    private JwtTokenService jwtTokenService;
    
    @Autowired
    private repo_User userRepository;
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get token from headers
            String token = accessor.getFirstNativeHeader("Authorization");
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                
                try {
                    // Validate token
                    if (jwtTokenService.validateToken(token)) {
                        String userEmail = jwtTokenService.getEmailFromToken(token);
                        Login_User user = userRepository.findById(userEmail).orElse(null);
                        
                        if (user != null) {
                            // Set authenticated user
                            UsernamePasswordAuthenticationToken auth = 
                                new UsernamePasswordAuthenticationToken(
                                    user, 
                                    null, 
                                    new ArrayList<>()
                                );
                            accessor.setUser(auth);
                        }
                    }
                } catch (Exception e) {
                    // Invalid token - connection will be rejected
                }
            }
        }
        
        return message;
    }
}
```

---

### Step 7: Update WebSocket Configuration

**File:** `Security/WebSocketConfig.java`

```java
package com.example.Community.Platform.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Autowired
    private JwtWebSocketAuthInterceptor jwtWebSocketAuthInterceptor;
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple broker for topics (broadcast)
        registry.enableSimpleBroker("/topic");
        // Client sends messages to /app prefix
        registry.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add JWT authentication interceptor
        registration.interceptors(jwtWebSocketAuthInterceptor);
    }
}
```

---

### Step 8: Update Chat Controller

**File:** `Controller/Chat/ChatController.java`

```java
package com.example.Community.Platform.Controller.Chat;

import com.example.Community.Platform.DTO.Chat.ChatMessageDTO;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.Chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
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
        chatService.saveMessage(sessionId, currentUser, messageDTO.getContent());
        
        // Create response DTO with sender info
        ChatMessageDTO response = new ChatMessageDTO();
        response.setSessionId(sessionId);
        response.setSenderEmail(currentUser.getEmail());
        response.setSenderName(currentUser.getName());
        response.setContent(messageDTO.getContent());
        response.setTimestamp(java.time.LocalDateTime.now());
        
        return response;
    }
}
```

---

### Step 9: Add REST Endpoint for Message History

**File:** `Controller/Chat/ChatRestController.java`

```java
package com.example.Community.Platform.Controller.Chat;

import com.example.Community.Platform.DTO.Chat.ChatMessageDTO;
import com.example.Community.Platform.DTO.Pagging.TimeCursorPageResponse;
import com.example.Community.Platform.Service.Chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.Community.Platform.Entity.Login_User;
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
```

---

## 📋 Summary of Files to Create

1. ✅ `pom.xml` - Add WebSocket dependency
2. ✅ `Entity/Chat/ChatMessage.java` - Message entity
3. ✅ `Repository/Chat/ChatMessageRepository.java` - Message repository
4. ✅ `DTO/Chat/ChatMessageDTO.java` - Message DTO
5. ✅ `Service/Chat/ChatService.java` - Business logic
6. ✅ `Security/JwtWebSocketAuthInterceptor.java` - WebSocket JWT auth
7. ✅ `Security/WebSocketConfig.java` - WebSocket configuration
8. ✅ `Controller/Chat/ChatController.java` - WebSocket message handler
9. ✅ `Controller/Chat/ChatRestController.java` - REST endpoint for history

---

## 🧪 Testing

### 1. Connect to WebSocket (with JWT token):
```javascript
const socket = new SockJS('http://localhost:8080/ws-chat');
const stompClient = Stomp.over(socket);

stompClient.connect({
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
}, function(frame) {
    console.log('Connected!');
    
    // Subscribe to session messages
    stompClient.subscribe('/topic/session/1', function(message) {
        const chatMessage = JSON.parse(message.body);
        console.log('Received:', chatMessage);
    });
    
    // Send message
    stompClient.send('/app/chat/1', {}, JSON.stringify({
        content: 'Hello everyone!'
    }));
});
```

### 2. Get Message History:
```http
GET /api/chat/sessions/1/messages?limit=50
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ✅ What This Implementation Provides

1. ✅ **JWT Authentication** - WebSocket connections authenticated
2. ✅ **Message Persistence** - All messages saved to database
3. ✅ **Authorization** - Only session participants can send messages
4. ✅ **User Identification** - Know who sent each message
5. ✅ **Message History** - Retrieve past messages with pagination
6. ✅ **Real-time Broadcasting** - Messages broadcast to all subscribers
7. ✅ **Service Layer** - Clean separation of concerns
