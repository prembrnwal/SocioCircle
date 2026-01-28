package com.example.Community.Platform.Service.Jamming_Service;

import com.example.Community.Platform.DTO.Jamming_Dto.CreateJammingSessionRequest;
import com.example.Community.Platform.DTO.Jamming_Dto.JammingSessionResponse;
import com.example.Community.Platform.DTO.Jamming_Dto.ParticipantResponse;
import com.example.Community.Platform.DTO.Pagging.TimeCursorPageResponse;
import com.example.Community.Platform.Entity.InterestGroup;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingParticipant;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Enum.SessionStatus;
import com.example.Community.Platform.Repository.InterestGroupRepository;
import com.example.Community.Platform.Repository.Jamming_Repo.JammingParticipantRepository;
import com.example.Community.Platform.Repository.Jamming_Repo.JammingSessionRepository;
import com.example.Community.Platform.Repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JammingSessionService {

    @Autowired
    private JammingSessionRepository sessionRepo;

    @Autowired
    private JammingParticipantRepository participantRepo;

    @Autowired
    private InterestGroupRepository groupRepo;

    @Autowired
    private MembershipRepository membershipRepo;

    /* CREATE SESSION */
    public JammingSession createSession(
            Long groupId,
            CreateJammingSessionRequest request,
            Login_User currentUser) {

        InterestGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!membershipRepo.existsByUserAndGroup(currentUser, group)) {
            throw new RuntimeException("User is not group member");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start time must be in future");
        }

        JammingSession session = new JammingSession();
        session.setGroup(group);
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setStartTime(request.getStartTime());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setCreatedBy(currentUser);
        session.setStatus(SessionStatus.UPCOMING);

        return sessionRepo.save(session);
    }

    /* JOIN SESSION */
    public void joinSession(Long sessionId, Login_User user) {

        JammingSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new RuntimeException("Session ended");
        }

        if (participantRepo.existsBySessionAndUser(session, user)) {
            throw new RuntimeException("Already joined");
        }

        JammingParticipant participant = new JammingParticipant();
        participant.setSession(session);
        participant.setUser(user);

        participantRepo.save(participant);
    }

    /* LEAVE SESSION */
    public void leaveSession(Long sessionId, Login_User user) {

        JammingSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!membershipRepo.existsByUserAndGroup(user, session.getGroup())) {
            throw new RuntimeException("Not authorized");
        }
        
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new RuntimeException("Session already ended");
        }

        JammingParticipant participant = participantRepo
                .findBySessionAndUserAndLeftAtIsNull(session, user)
                .orElseThrow(() -> new RuntimeException("Not joined"));

        if (participant.getLeftAt() != null) {
            throw new RuntimeException("Already left session");
        }

        participant.setLeftAt(LocalDateTime.now());
        participantRepo.save(participant);
    }

    /* PARTICIPANTS LIST */
    public List<JammingParticipant> getParticipants(Long sessionId) {

        JammingSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return participantRepo.findBySessionAndLeftAtIsNull(session);
    }

    /* GET SESSIONS BY GROUP - Cursor-based pagination */
    public TimeCursorPageResponse<JammingSessionResponse> getSessionsByGroupCursor(
            Long groupId,
            LocalDateTime cursor,
            int limit) {

        Pageable pageable = PageRequest.of(0, limit + 1); // Fetch one extra to check if there's more

        List<JammingSession> sessions;
        if (cursor == null) {
            // First page
            sessions = sessionRepo.findByGroupIdOrderByStartTimeDesc(groupId, pageable);
        } else {
            // Subsequent pages
            sessions = sessionRepo.findByGroupIdAndStartTimeLessThanOrderByStartTimeDesc(
                    groupId, cursor, pageable);
        }

        boolean hasNext = sessions.size() > limit;
        if (hasNext) {
            sessions = sessions.subList(0, limit); // Remove the extra item
        }

        List<JammingSessionResponse> responseList = sessions.stream()
                .map(this::mapToResponse)
                .toList();

        LocalDateTime nextCursor = responseList.isEmpty() ? null : 
                responseList.get(responseList.size() - 1).getStartTime();

        return new TimeCursorPageResponse<>(responseList, nextCursor, hasNext, responseList.size());
    }

    /* GET PARTICIPANTS - Cursor-based pagination */
    public TimeCursorPageResponse<ParticipantResponse> getParticipantsCursor(
            Long sessionId,
            LocalDateTime cursor,
            int limit) {

        JammingSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Pageable pageable = PageRequest.of(0, limit + 1); // Fetch one extra to check if there's more

        List<JammingParticipant> participants;
        if (cursor == null) {
            // First page
            participants = participantRepo.findBySessionAndLeftAtIsNullOrderByJoinedAtDesc(
                    session, pageable);
        } else {
            // Subsequent pages
            participants = participantRepo.findBySessionAndLeftAtIsNullAndJoinedAtLessThanOrderByJoinedAtDesc(
                    session, cursor, pageable);
        }

        boolean hasNext = participants.size() > limit;
        if (hasNext) {
            participants = participants.subList(0, limit); // Remove the extra item
        }

        List<ParticipantResponse> responseList = participants.stream().map(p -> {
            ParticipantResponse dto = new ParticipantResponse();
            dto.setUserId(p.getUser().getEmail()); // Use email as userId
            dto.setUsername(p.getUser().getName()); // Use name as username
            dto.setJoinedAt(p.getJoinedAt());
            return dto;
        }).toList();

        LocalDateTime nextCursor = responseList.isEmpty() ? null : 
                responseList.get(responseList.size() - 1).getJoinedAt();

        return new TimeCursorPageResponse<>(responseList, nextCursor, hasNext, responseList.size());
    }

    private JammingSessionResponse mapToResponse(JammingSession session) {
        JammingSessionResponse dto = new JammingSessionResponse();
        dto.setId(session.getId());
        dto.setTitle(session.getTitle());
        dto.setDescription(session.getDescription());
        dto.setStartTime(session.getStartTime());
        dto.setDurationMinutes(session.getDurationMinutes());
        dto.setStatus(session.getStatus());
        dto.setGroupId(session.getGroup().getId());
        dto.setCreatedBy(session.getCreatedBy().getEmail());
        return dto;
    }

}
