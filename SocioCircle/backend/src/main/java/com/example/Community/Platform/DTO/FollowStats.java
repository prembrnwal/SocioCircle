package com.example.Community.Platform.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FollowStats {
    private long followersCount;
    private long followingCount;
    private boolean isFollowing; // Whether current user follows this user
}
