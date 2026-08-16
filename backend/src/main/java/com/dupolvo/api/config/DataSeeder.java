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

    @Value("${superadmin.email:superadmin@gmail.com}")
    private String superAdminEmail;

    @Value("${superadmin.password:Dupolvo@Master2026}")
    private String superAdminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        var existing = userRepository.findByEmail(superAdminEmail);

        if (existing.isEmpty()) {
            User superAdmin = new User();
            superAdmin.setName("Super Admin");
            superAdmin.setEmail(superAdminEmail);
            superAdmin.setPhone("00000000000");
            superAdmin.setPassword(passwordEncoder.encode(superAdminPassword));
            superAdmin.setRole("SUPER_ADMIN");
            superAdmin.setCity("master");
            superAdmin.setStatus("ACTIVE");
            userRepository.save(superAdmin);
            return;
        }

        // O e-mail reservado pro super admin ja existe (por exemplo, foi
        // cadastrado sem querer como usuario comum pelo /register antes do
        // seeder rodar). Promove essa conta em vez de desistir silenciosamente
        // - mantem a senha que a pessoa ja definiu, so ajusta cargo/status.
        User user = existing.get();
        if (!"SUPER_ADMIN".equals(user.getRole())) {
            user.setRole("SUPER_ADMIN");
            user.setStatus("ACTIVE");
            user.setCity("master");
            userRepository.save(user);
        }
    }
}
