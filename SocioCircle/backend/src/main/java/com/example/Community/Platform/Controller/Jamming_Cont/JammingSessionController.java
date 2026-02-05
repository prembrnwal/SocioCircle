package com.example.Community.Platform.Controller.Jamming_Cont;

import com.example.Community.Platform.DTO.Jamming_Dto.CreateJammingSessionRequest;
import com.example.Community.Platform.DTO.Jamming_Dto.JammingSessionResponse;
import com.example.Community.Platform.DTO.Jamming_Dto.ParticipantResponse;
import com.example.Community.Platform.DTO.Pagging.TimeCursorPageResponse;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.Jamming_Service.JammingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/jamming-sessions")
public class JammingSessionController {

    @Autowired
    private JammingSessionService service;

    // CREATE SESSION
    @PostMapping("/groups/{groupId}")
    public ResponseEntity<JammingSession> create(
            @PathVariable Long groupId,
            @RequestBody CreateJammingSessionRequest request,
            @AuthenticationPrincipal Login_User user) {
        return ResponseEntity.ok(service.createSession(groupId, request, user));
    }

    // GET SESSIONS BY GROUP - Cursor-based pagination
    @GetMapping("/groups/{groupId}")
    public ResponseEntity<TimeCursorPageResponse<JammingSessionResponse>> listSessions(
            @PathVariable Long groupId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.getSessionsByGroupCursor(groupId, cursor, limit));
    }

    // JOIN SESSION
    @PostMapping("/{id}/join")
    public ResponseEntity<String> join(@PathVariable Long id,
                                        @AuthenticationPrincipal Login_User user) {
        service.joinSession(id, user);
        return ResponseEntity.ok("Joined session successfully");
    }

    // LEAVE SESSION
    @PostMapping("/{id}/leave")
    public ResponseEntity<String> leave(@PathVariable Long id,
                                         @AuthenticationPrincipal Login_User user) {
        service.leaveSession(id, user);
        return ResponseEntity.ok("Left session successfully");
    }

    // GET PARTICIPANTS - Cursor-based pagination
    @GetMapping("/{id}/participants")
    public ResponseEntity<TimeCursorPageResponse<ParticipantResponse>> listParticipants(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(service.getParticipantsCursor(id, cursor, limit));
    }

    // GET PARTICIPANTS (Legacy - returns all, no pagination)
    @GetMapping("/{id}/participants/all")
    public ResponseEntity<List<com.example.Community.Platform.Entity.Jamming_Entity.JammingParticipant>> getAllParticipants(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.getParticipants(id));
    }
}

