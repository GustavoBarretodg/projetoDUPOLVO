package com.dupolvo.api.repository;

import com.dupolvo.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByCity(String city);
    Optional<User> findByCityAndRole(String city, String role);
    List<User> findByRoleAndStatus(String role, String status);
    List<User> findByRoleNot(String role);
}
