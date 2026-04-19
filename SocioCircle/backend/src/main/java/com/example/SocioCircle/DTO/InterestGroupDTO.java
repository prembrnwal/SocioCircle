package com.example.SocioCircle.DTO;

import com.example.SocioCircle.Entity.InterestGroup;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InterestGroupDTO {

    private Long id;
    private String name;
    private String description;
    private long memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CreatedByDTO createdBy;

    @Getter
    @Setter
    public static class CreatedByDTO {
        private String email;
        private String name;

        public CreatedByDTO(String email, String name) {
            this.email = email;
            this.name = name;
        }
    }

    public static InterestGroupDTO from(InterestGroup group, long memberCount) {
        InterestGroupDTO dto = new InterestGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setMemberCount(memberCount);
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());
        if (group.getCreatedBy() != null) {
            dto.setCreatedBy(new CreatedByDTO(
                group.getCreatedBy().getEmail(),
                group.getCreatedBy().getName()
            ));
        }
        return dto;
    }
}
