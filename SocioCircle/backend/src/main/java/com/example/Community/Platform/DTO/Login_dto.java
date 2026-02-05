package com.example.Community.Platform.DTO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class Login_dto {

//        private String name;
//        private String email;
//        private String bio;
//        private String interests;


                public Login_dto(String userId,String password ) {

                        this.userId = userId;
                        this.password = password;
                }
                public Login_dto(){}

                private String userId;
                private String password;
}
