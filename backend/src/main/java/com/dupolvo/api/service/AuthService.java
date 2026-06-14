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

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        response.put("message", "authenticated_user");
        response.put("token", token);
        response.put("data", user);
        return response;
    }

    public Map<String, Object> register(String name, String email, String phone, String password) {
        Map<String, Object> response = new HashMap<>();

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);

        response.put("message", "user_created");
        return response;
    }
}
