package com.example.SocioCircle.Entity.Chat;

import com.example.SocioCircle.Entity.Jamming_Entity.JammingSession;
import com.example.SocioCircle.Entity.Login_User;
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


