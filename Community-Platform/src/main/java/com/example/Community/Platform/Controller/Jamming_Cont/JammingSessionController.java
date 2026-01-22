package com.example.Community.Platform.Controller.Jamming_Cont;

import com.example.Community.Platform.DTO.Jamming_Dto.CreateJammingSessionRequest;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingParticipant;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.Jamming_Service.JammingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jamming-sessions")
public class JammingSessionController {

    @Autowired
    private JammingSessionService service;

    @PostMapping("/groups/{groupId}")
    public JammingSession create(
            @PathVariable Long groupId,
            @RequestBody CreateJammingSessionRequest request,
            @AuthenticationPrincipal Login_User user) {

        return service.createSession(groupId, request, user);
    }

    @PostMapping("/{id}/join")
    public void join(@PathVariable Long id,
                     @AuthenticationPrincipal Login_User user) {
        service.joinSession(id, user);
    }

    @PostMapping("/{id}/leave")
    public void leave(@PathVariable Long id,
                      @AuthenticationPrincipal Login_User user) {
        service.leaveSession(id, user);
    }

    @GetMapping("/{id}/participants")
    public List<JammingParticipant> participants(@PathVariable Long id) {
        return service.getParticipants(id);
    }
}

