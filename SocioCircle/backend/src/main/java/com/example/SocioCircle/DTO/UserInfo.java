package com.example.SocioCircle.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String email;
    private String name;
    private String bio;
    private String interests;
    private String profilePicture;
}


