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
