package com.example.SocioCircle;

import com.example.SocioCircle.Entity.Jamming_Entity.JammingSession;
import com.example.SocioCircle.Service.Jamming_Service.JammingSessionService;
import com.example.SocioCircle.Repository.Jamming_Repo.JammingSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class JammingSessionServiceTest {

    @Mock
    private JammingSessionRepository jammingSessionRepository;

    @InjectMocks
    private JammingSessionService jammingSessionService;

    @Test
    void testFindSessionById() {
        JammingSession session = new JammingSession();
        session.setId(1L);
        session.setTitle("Test Jam");
        
        when(jammingSessionRepository.findById(1L)).thenReturn(Optional.of(session));
        
        JammingSession found = jammingSessionRepository.findById(1L).get();
        
        assertNotNull(found);
        assertEquals("Test Jam", found.getTitle());
        verify(jammingSessionRepository, times(1)).findById(1L);
    }
}
