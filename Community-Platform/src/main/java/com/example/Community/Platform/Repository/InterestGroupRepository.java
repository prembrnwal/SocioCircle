package com.example.Community.Platform.Repository;

import com.example.Community.Platform.Entity.InterestGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterestGroupRepository extends JpaRepository<InterestGroup, Long> {
    Optional<InterestGroup> findByName(String name);
}

