package com.dupolvo.api.controller;

import com.dupolvo.api.service.AuthService;
import com.dupolvo.api.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        return ResponseEntity.ok(authService.login(email, password));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");
        String password = body.get("password");
        String role = body.get("role");
        String city = body.get("city");
        return ResponseEntity.ok(authService.register(name, email, phone, password, role, city));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(passwordResetService.forgotPassword(body.get("email")));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(passwordResetService.verifyOtp(body.get("email"), body.get("otp")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(passwordResetService.resetPassword(
                body.get("email"), body.get("resetToken"), body.get("newPassword")));
    }
}
