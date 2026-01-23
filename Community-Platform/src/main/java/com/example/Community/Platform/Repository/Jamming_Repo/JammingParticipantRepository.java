package com.example.Community.Platform.Repository.Jamming_Repo;

import com.example.Community.Platform.Entity.Jamming_Entity.JammingParticipant;
import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Entity.Login_User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JammingParticipantRepository extends JpaRepository<JammingParticipant, Long> {

    boolean existsBySessionAndUser(JammingSession session, Login_User user);

    List<JammingParticipant> findBySessionAndLeftAtIsNull(JammingSession session);

    Optional<JammingParticipant> findBySessionAndUserAndLeftAtIsNull(
            JammingSession session, Login_User user);

    // Cursor-based pagination: Get participants after a specific joinedAt (newest first)
    List<JammingParticipant> findBySessionAndLeftAtIsNullAndJoinedAtLessThanOrderByJoinedAtDesc(
            JammingSession session,
            LocalDateTime cursor,
            Pageable pageable
    );

    // Cursor-based pagination: Get first page (newest first)
    List<JammingParticipant> findBySessionAndLeftAtIsNullOrderByJoinedAtDesc(
            JammingSession session,
            Pageable pageable
    );
}

