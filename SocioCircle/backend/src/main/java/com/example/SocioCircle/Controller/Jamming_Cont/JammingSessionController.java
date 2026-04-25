package com.example.SocioCircle.Controller.Jamming_Cont;

import com.example.SocioCircle.DTO.Jamming_Dto.CreateJammingSessionRequest;
import com.example.SocioCircle.DTO.Jamming_Dto.JammingSessionResponse;
import com.example.SocioCircle.DTO.Jamming_Dto.ParticipantResponse;
import com.example.SocioCircle.DTO.Pagging.TimeCursorPageResponse;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Service.Jamming_Service.JammingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jamming-sessions")
public class JammingSessionController {

    @Autowired
    private JammingSessionService service;

    // CREATE SESSION
    @PostMapping("/groups/{groupId}")
    public ResponseEntity<JammingSessionResponse> create(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateJammingSessionRequest request,
            @AuthenticationPrincipal Login_User user) {
        return ResponseEntity.ok(service.createSessionAndReturn(groupId, request, user));
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

    // GET SESSION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<JammingSessionResponse> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(service.getSessionById(id));
    }

    // JOIN SESSION
    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, String>> join(@PathVariable Long id,
                                        @AuthenticationPrincipal Login_User user) {
        service.joinSession(id, user);
        return ResponseEntity.ok(Map.of("message", "Joined session successfully"));
    }

    // LEAVE SESSION
    @PostMapping("/{id}/leave")
    public ResponseEntity<Map<String, String>> leave(@PathVariable Long id,
                                         @AuthenticationPrincipal Login_User user) {
        service.leaveSession(id, user);
        return ResponseEntity.ok(Map.of("message", "Left session successfully"));
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
    public ResponseEntity<List<ParticipantResponse>> getAllParticipants(
            @PathVariable Long id) {
        List<com.example.SocioCircle.Entity.Jamming_Entity.JammingParticipant> participants = service.getParticipants(id);
        List<ParticipantResponse> responseList = participants.stream().map(p -> {
            ParticipantResponse dto = new ParticipantResponse();
            dto.setId(p.getId());
            dto.setSessionId(p.getSession().getId());
            dto.setUserEmail(p.getUser().getEmail()); 
            dto.setUserName(p.getUser().getName()); 
            dto.setUserProfilePicture(p.getUser().getProfilePicture());
            dto.setJoinedAt(p.getJoinedAt());
            return dto;
        }).toList();
        return ResponseEntity.ok(responseList);
    }
}



