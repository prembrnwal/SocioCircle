package com.example.SocioCircle.Service;

import com.example.SocioCircle.DTO.GroupMemberDTO;
import com.example.SocioCircle.DTO.InterestGroupDTO;
import com.example.SocioCircle.Entity.InterestGroup;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Entity.Membership;
import com.example.SocioCircle.Repository.InterestGroupRepository;
import com.example.SocioCircle.Repository.Jamming_Repo.JammingSessionRepository;
import com.example.SocioCircle.Repository.MembershipRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class interestGroupService {

    @Autowired
    private InterestGroupRepository interestGroupRepository;
    @Autowired
    private MembershipRepository membershipRepository;
    @Autowired
    private JammingSessionRepository jammingSessionRepository;

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

        InterestGroup saved = interestGroupRepository.save(group);

        // Auto-enroll creator as the first member
        Membership membership = new Membership();
        membership.setUser(creator);
        membership.setGroup(saved);
        membership.setJoinedAt(LocalDateTime.now());
        membershipRepository.save(membership);

        return saved;
    }

    public void deleteGroup(Long groupId, Login_User currentUser) {
        InterestGroup group = interestGroupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));

        // Only the creator may delete the group
        if (!group.getCreatedBy().getEmail().equals(currentUser.getEmail())) {
            throw new IllegalStateException("Only the group creator can delete this group");
        }

        // Delete all memberships, then sessions, then the group
        membershipRepository.deleteAll(membershipRepository.findByGroup(group));
        jammingSessionRepository.deleteAll(jammingSessionRepository.findByGroupId(groupId));
        interestGroupRepository.delete(group);
    }

    public List<InterestGroupDTO> listGroups() {
        return interestGroupRepository.findAll().stream()
                .map(g -> InterestGroupDTO.from(g, membershipRepository.countByGroup(g)))
                .toList();
    }

    public InterestGroup getGroupById(Long groupId) {
        return interestGroupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));
    }

    public InterestGroupDTO getGroupDTOById(Long groupId) {
        InterestGroup group = getGroupById(groupId);
        return InterestGroupDTO.from(group, membershipRepository.countByGroup(group));
    }

    public List<GroupMemberDTO> getGroupMembers(Long groupId, Login_User requestingUser) {
        InterestGroup group = getGroupById(groupId);
        if (!group.getCreatedBy().getEmail().equals(requestingUser.getEmail())) {
            throw new IllegalStateException("Only the group creator can view the member list");
        }
        return membershipRepository.findByGroupOrderByJoinedAtAsc(group)
                .stream()
                .map(GroupMemberDTO::from)
                .collect(Collectors.toList());
    }

    public void kickMember(Long groupId, String memberEmail, Login_User requestingUser) {
        InterestGroup group = getGroupById(groupId);
        if (!group.getCreatedBy().getEmail().equals(requestingUser.getEmail())) {
            throw new IllegalStateException("Only the group creator can kick members");
        }
        if (memberEmail.equals(requestingUser.getEmail())) {
            throw new IllegalArgumentException("You cannot kick yourself");
        }
        membershipRepository.deleteByGroupAndUser_Email(group, memberEmail);
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

    public boolean isMember(Login_User user, InterestGroup group) {
        return membershipRepository.existsByUserAndGroup(user, group);
    }

}


