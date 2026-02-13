package com.example.SocioCircle.Repository;

import com.example.SocioCircle.Entity.InterestGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterestGroupRepository extends JpaRepository<InterestGroup, Long> {
    Optional<InterestGroup> findByName(String name);
}



