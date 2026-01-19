package com.example.Community.Platform.Service;

import com.example.Community.Platform.Entity.InterestGroup;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Entity.Membership;
import com.example.Community.Platform.Repository.InterestGroupRepository;
import com.example.Community.Platform.Repository.MembershipRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class interestGroupService {

    @Autowired
    private InterestGroupRepository interestGroupRepository;
    @Autowired
    private MembershipRepository membershipRepository;

    public InterestGroup createGroup(String name, String description, Login_User creator) {
        if (interestGroupRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Group name already exists");
        }
        
        InterestGroup group = new InterestGroup();
        group.setName(name);
        group.setDescription(description);
        group.setCreatedBy(creator);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        
        return interestGroupRepository.save(group);
    }

    public List<InterestGroup> listGroups() {
        return interestGroupRepository.findAll();
    }

    public InterestGroup getGroupById(Long groupId) {
        return interestGroupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));
    }

    public void joinGroup(Login_User user, InterestGroup group) {
        if (membershipRepository.existsByUserAndGroup(user, group)) {
            throw new IllegalStateException("User already member");
        }
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setGroup(group);
        membership.setJoinedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    public void leaveGroup(Login_User user, InterestGroup group) {
        if (!membershipRepository.existsByUserAndGroup(user, group)) {
            throw new IllegalStateException("User is not a member");
        }
        membershipRepository.deleteByUserAndGroup(user, group);
    }


}
