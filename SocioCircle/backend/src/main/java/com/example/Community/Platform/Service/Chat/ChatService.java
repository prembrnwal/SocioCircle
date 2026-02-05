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
        
        // Check if user is active participant
        if (participantRepo.findBySessionAndUserAndLeftAtIsNull(session, sender).isEmpty()) {
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
