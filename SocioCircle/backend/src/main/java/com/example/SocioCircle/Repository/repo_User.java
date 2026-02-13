package com.example.SocioCircle.Repository;

import com.example.SocioCircle.Entity.Login_User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface repo_User  extends JpaRepository<Login_User,String> {
}



