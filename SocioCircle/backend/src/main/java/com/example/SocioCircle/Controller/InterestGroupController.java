package com.example.SocioCircle.Controller;

import com.example.SocioCircle.DTO.CreateGroupRequest;
import com.example.SocioCircle.DTO.GroupMemberDTO;
import com.example.SocioCircle.DTO.InterestGroupDTO;
import com.example.SocioCircle.Entity.InterestGroup;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Service.interestGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class InterestGroupController {

    @Autowired
    private interestGroupService interestGroupService;

    // Create group
    @PostMapping
    public ResponseEntity<InterestGroupDTO> createGroup(@RequestBody CreateGroupRequest request,
                                                        @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.createGroup(request.getName(), request.getDescription(), currentUser);
        return new ResponseEntity<>(InterestGroupDTO.from(group, 0), HttpStatus.CREATED);
    }

    // List all groups
    @GetMapping
    public List<InterestGroupDTO> getAllGroups() {
        return interestGroupService.listGroups();
    }

    // Get group details
    @GetMapping("/{groupId}")
    public InterestGroupDTO getGroup(@PathVariable Long groupId) {
        return interestGroupService.getGroupDTOById(groupId);
    }

    // Check if current user is a member
    @GetMapping("/{groupId}/is-member")
    public ResponseEntity<Boolean> isMember(@PathVariable Long groupId,
                                            @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.getGroupById(groupId);
        return ResponseEntity.ok(interestGroupService.isMember(currentUser, group));
    }

    // Join group
    @PostMapping("/{groupId}/join")
    public ResponseEntity<Map<String, String>> joinGroup(@PathVariable Long groupId,
                                            @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.getGroupById(groupId);
        interestGroupService.joinGroup(currentUser, group);
        return ResponseEntity.ok(Map.of("message", "Joined group successfully"));
    }

    // Leave group
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Map<String, String>> leaveGroup(@PathVariable Long groupId,
                                             @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.getGroupById(groupId);
        interestGroupService.leaveGroup(currentUser, group);
        return ResponseEntity.ok(Map.of("message", "Left group successfully"));
    }

    // Delete group (creator only)
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Map<String, String>> deleteGroup(@PathVariable Long groupId,
                                                           @AuthenticationPrincipal Login_User currentUser) {
        interestGroupService.deleteGroup(groupId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }

    // Get all members (creator only)
    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(@PathVariable Long groupId,
                                                                @AuthenticationPrincipal Login_User currentUser) {
        List<GroupMemberDTO> members = interestGroupService.getGroupMembers(groupId, currentUser);
        return ResponseEntity.ok(members);
    }

    // Kick a member (creator only)
    @DeleteMapping("/{groupId}/members/{memberEmail}")
    public ResponseEntity<Map<String, String>> kickMember(@PathVariable Long groupId,
                                                          @PathVariable String memberEmail,
                                                          @AuthenticationPrincipal Login_User currentUser) {
        interestGroupService.kickMember(groupId, memberEmail, currentUser);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }
}



