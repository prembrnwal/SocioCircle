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
