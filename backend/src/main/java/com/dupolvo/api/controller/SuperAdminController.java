package com.dupolvo.api.controller;

import com.dupolvo.api.service.SuperAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(superAdminService.getDashboard());
    }

    @GetMapping("/pending-admins")
    public ResponseEntity<Map<String, Object>> getPendingAdmins() {
        return ResponseEntity.ok(superAdminService.getPendingAdmins());
    }

    @PostMapping("/approve-admin")
    public ResponseEntity<Map<String, Object>> approveAdmin(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("user_id").toString());
        boolean approved = Boolean.parseBoolean(body.get("approved").toString());
        return ResponseEntity.ok(superAdminService.approveAdmin(userId, approved));
    }

    @DeleteMapping("/reset-users")
    public ResponseEntity<Map<String, Object>> resetUsers(@RequestParam(required = false) String confirm) {
        if (!"RESET".equals(confirm)) {
            return ResponseEntity.ok(Map.of("message", "confirmation_required"));
        }
        return ResponseEntity.ok(superAdminService.resetUsers());
    }
}
