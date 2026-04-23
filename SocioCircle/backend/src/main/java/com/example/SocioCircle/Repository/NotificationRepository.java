package com.example.SocioCircle.Repository;

import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(Login_User recipient);
    long countByRecipientAndReadFalse(Login_User recipient);
}
