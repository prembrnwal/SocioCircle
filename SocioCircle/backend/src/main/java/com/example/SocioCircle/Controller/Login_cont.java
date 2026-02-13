package com.example.SocioCircle.Controller;

import com.example.SocioCircle.DTO.Login_dto;
import com.example.SocioCircle.DTO.LoginResponse;
import com.example.SocioCircle.Entity.Login_User;
import com.example.SocioCircle.Service.serviceUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Login_cont {

    @Autowired
    serviceUser userservice;

    @PostMapping("/adduser")
    public ResponseEntity<Login_User> adduser(@RequestBody Login_User user){
        return ResponseEntity.ok(userservice.addUser(user));
    }

    @PostMapping("/loginUser")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody Login_dto LoginRequest){
        return ResponseEntity.ok(userservice.loginUser(LoginRequest));
    }

    @PutMapping("/loginUser")
    public ResponseEntity<LoginResponse> loginUserPut(@RequestBody Login_dto LoginRequest) {
        return ResponseEntity.ok(userservice.loginUser(LoginRequest));
    }
}

