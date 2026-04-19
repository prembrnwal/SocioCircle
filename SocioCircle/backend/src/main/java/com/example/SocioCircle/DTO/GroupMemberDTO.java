package com.example.SocioCircle.DTO;

import com.example.SocioCircle.Entity.Membership;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class GroupMemberDTO {

    private String email;
    private String name;
    private String bio;
    private String interests;
    private String profilePicture;
    private LocalDateTime joinedAt;

    public static GroupMemberDTO from(Membership membership) {
        GroupMemberDTO dto = new GroupMemberDTO();
        dto.setEmail(membership.getUser().getEmail());
        dto.setName(membership.getUser().getName());
        dto.setBio(membership.getUser().getBio());
        dto.setInterests(membership.getUser().getInterests());
        dto.setProfilePicture(membership.getUser().getProfilePicture());
        dto.setJoinedAt(membership.getJoinedAt());
        return dto;
    }
}
