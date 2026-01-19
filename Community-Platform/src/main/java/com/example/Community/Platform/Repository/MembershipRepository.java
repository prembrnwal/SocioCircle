package com.example.Community.Platform.Repository;

import com.example.Community.Platform.Entity.InterestGroup;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    boolean existsByUserAndGroup(Login_User user, InterestGroup group);
    void deleteByUserAndGroup(Login_User user, InterestGroup group);
    List<Membership> findByUser(Login_User user);
    List<Membership> findByGroup(InterestGroup group);
}
