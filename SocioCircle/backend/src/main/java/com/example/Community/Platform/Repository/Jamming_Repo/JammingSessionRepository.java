package com.example.Community.Platform.Repository.Jamming_Repo;

import com.example.Community.Platform.Entity.Jamming_Entity.JammingSession;
import com.example.Community.Platform.Enum.SessionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JammingSessionRepository extends JpaRepository<JammingSession, Long> {

    List<JammingSession> findByGroupId(Long groupId);

    List<JammingSession> findByStatus(SessionStatus status);

    // Cursor-based pagination: Get sessions after a specific startTime (newest first)
    List<JammingSession> findByGroupIdAndStartTimeLessThanOrderByStartTimeDesc(
            Long groupId,
            LocalDateTime cursor,
            Pageable pageable
    );

    // Cursor-based pagination: Get first page (newest first)
    List<JammingSession> findByGroupIdOrderByStartTimeDesc(
            Long groupId,
            Pageable pageable
    );
}

