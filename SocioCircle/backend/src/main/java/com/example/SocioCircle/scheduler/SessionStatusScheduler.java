package com.example.SocioCircle.scheduler;

import com.example.SocioCircle.Entity.Jamming_Entity.JammingSession;
import com.example.SocioCircle.Enum.SessionStatus;
import com.example.SocioCircle.Repository.Jamming_Repo.JammingSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@EnableScheduling
public class SessionStatusScheduler {

    @Autowired
    private JammingSessionRepository sessionRepo;

    @Scheduled(fixedRate = 60000) // every 1 minute
    public void updateSessionStatus() {

        LocalDateTime now = LocalDateTime.now();

        for (JammingSession session : sessionRepo.findAll()) {

            LocalDateTime endTime =
                    session.getStartTime().plusMinutes(session.getDurationMinutes());

            if (session.getStatus() == SessionStatus.UPCOMING &&
                    now.isAfter(session.getStartTime())) {
                session.setStatus(SessionStatus.LIVE);
            }

            if (session.getStatus() == SessionStatus.LIVE &&
                    now.isAfter(endTime)) {
                session.setStatus(SessionStatus.ENDED);
            }
        }

        sessionRepo.flush();
    }
}


