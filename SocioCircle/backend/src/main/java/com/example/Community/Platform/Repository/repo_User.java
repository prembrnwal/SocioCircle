package com.example.Community.Platform.Repository;

import com.example.Community.Platform.Entity.Login_User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface repo_User  extends JpaRepository<Login_User,String> {
}

