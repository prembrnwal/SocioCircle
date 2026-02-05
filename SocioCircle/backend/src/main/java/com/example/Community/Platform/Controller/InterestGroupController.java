package com.example.Community.Platform.Controller;

import com.example.Community.Platform.DTO.CreateGroupRequest;
import com.example.Community.Platform.Entity.InterestGroup;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Service.interestGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class InterestGroupController {

    @Autowired
    private interestGroupService interestGroupService;

    // Create group
    @PostMapping
    public ResponseEntity<InterestGroup> createGroup(@RequestBody CreateGroupRequest request,
                                                     @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.createGroup(request.getName(), request.getDescription(), currentUser);
        return new ResponseEntity<>(group, HttpStatus.CREATED);
    }

    // List all groups
    @GetMapping
    public List<InterestGroup> getAllGroups() {
        return interestGroupService.listGroups();
    }

    // Get group details
    @GetMapping("/{groupId}")
    public InterestGroup getGroup(@PathVariable Long groupId) {
        return interestGroupService.getGroupById(groupId);
    }

    // Join group
    @PostMapping("/{groupId}/join")
    public ResponseEntity<String> joinGroup(@PathVariable Long groupId,
                                            @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.getGroupById(groupId);
        interestGroupService.joinGroup(currentUser, group);
        return ResponseEntity.ok("Joined group successfully");
    }

    // Leave group
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(@PathVariable Long groupId,
                                             @AuthenticationPrincipal Login_User currentUser) {
        InterestGroup group = interestGroupService.getGroupById(groupId);
        interestGroupService.leaveGroup(currentUser, group);
        return ResponseEntity.ok("Left group successfully");
    }
}

