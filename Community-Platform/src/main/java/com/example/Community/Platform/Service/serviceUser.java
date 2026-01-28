//package com.example.Community.Platform.Service;
//
//import com.example.Community.Platform.DTO.Login_dto;
//import com.example.Community.Platform.Entity.Login_User;
//import com.example.Community.Platform.Repository.repo_User;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.BadCredentialsException;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.util.Optional;
//
//@Service
//public class serviceUser {
//
//    @Autowired
//    private repo_User repo;
//
//    @Autowired
//    private BCryptPasswordEncoder encoder;
//
//    public Login_User addUser(Login_User user){
//        user.setPassword(encoder.encode(user.getPassword()));
//        return repo.save(user);
//    }
//
//    public Boolean loginUser(Login_dto LoginRequest){
//        Optional<Login_User> user = repo.findById(LoginRequest.getUserId());
//        if (!user.isPresent()){
//            throw new BadCredentialsException("Invalid email or password");
//        }
//        Login_User user1 = user.get();
//
//
////        if(!user1.getPassword().equals(encoder.encode(LoginRequest.getPassword()))) {
////            return false;
////        }
//        if (!encoder.matches(LoginRequest.getPassword(), user1.getPassword())) {
//            throw new BadCredentialsException("Invalid email or password");
//        }
//
//        return true;
//    }
//}


package com.example.Community.Platform.Service;

import com.example.Community.Platform.DTO.Login_dto;
import com.example.Community.Platform.DTO.LoginResponse;
import com.example.Community.Platform.DTO.UserInfo;
import com.example.Community.Platform.Entity.Login_User;
import com.example.Community.Platform.Repository.repo_User;
import com.example.Community.Platform.Security.JwtTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class serviceUser {

    @Autowired
    private repo_User repo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtTokenService jwtTokenService;

    public Login_User addUser(Login_User user){
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public LoginResponse loginUser(Login_dto LoginRequest){
        Optional<Login_User> user = repo.findById(LoginRequest.getUserId());
        if (!user.isPresent()){
            throw new BadCredentialsException("Invalid email or password");
        }
        Login_User user1 = user.get();

        if (!encoder.matches(LoginRequest.getPassword(), user1.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtTokenService.generateToken(user1.getEmail());

        // Create UserInfo object
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(user1.getEmail());
        userInfo.setName(user1.getName());
        userInfo.setBio(user1.getBio());
        userInfo.setInterests(user1.getInterests());

        // Create and return LoginResponse
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userInfo);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtTokenService.getExpiration());

        return response;
    }
}