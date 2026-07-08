package com.dupolvo.api.config;

import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${superadmin.email:gmichell48@gmail.com}")
    private String superAdminEmail;

    @Value("${superadmin.password:Dupolvo@Master2026}")
    private String superAdminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(superAdminEmail).isEmpty()) {
            User superAdmin = new User();
            superAdmin.setName("Super Admin");
            superAdmin.setEmail(superAdminEmail);
            superAdmin.setPhone("00000000000");
            superAdmin.setPassword(passwordEncoder.encode(superAdminPassword));
            superAdmin.setRole("SUPER_ADMIN");
            superAdmin.setCity("master");
            superAdmin.setStatus("ACTIVE");
            userRepository.save(superAdmin);
        }
    }
}
