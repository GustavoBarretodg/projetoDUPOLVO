package com.dupolvo.api.service;

import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Map<String, Object> login(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("message", "not_found_user");
            return response;
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("message", "failed_to_authenticate_user");
            return response;
        }

        if ("PENDING".equals(user.getStatus())) {
            response.put("message", "account_pending");
            return response;
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole(), user.getCity());

        response.put("message", "authenticated_user");
        response.put("token", token);
        response.put("data", user);
        return response;
    }

    public Map<String, Object> register(String name, String email, String phone, String password, String role, String city) {
        Map<String, Object> response = new HashMap<>();

        if (city == null || city.isBlank()) {
            response.put("message", "city_required");
            return response;
        }

        if (userRepository.findByEmail(email).isPresent()) {
            response.put("message", "email_already_exists");
            return response;
        }

        String normalizedRole = (role != null && role.equals("ADMIN")) ? "ADMIN" : "USER";

        if (normalizedRole.equals("ADMIN")) {
            boolean adminExists = userRepository.findByCityAndRole(city, "ADMIN").isPresent();
            if (adminExists) {
                response.put("message", "city_admin_exists");
                return response;
            }
        }

        String status = normalizedRole.equals("ADMIN") ? "PENDING" : "ACTIVE";

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(normalizedRole);
        user.setCity(city.trim());
        user.setStatus(status);

        userRepository.save(user);

        response.put("message", normalizedRole.equals("ADMIN") ? "admin_pending_approval" : "user_created");
        return response;
    }
}
