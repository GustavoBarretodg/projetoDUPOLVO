package com.dupolvo.api.controller;

import com.dupolvo.api.service.AdminService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/bets")
    public ResponseEntity<Map<String, Object>> getAllBets() {
        String city = extractCity();
        return ResponseEntity.ok(adminService.getAllBets(city));
    }

    @PostMapping("/bet/status")
    public ResponseEntity<Map<String, Object>> updateBetStatus(@RequestBody Map<String, Object> body) {
        Long betId = Long.valueOf(body.get("bet_id").toString());
        Boolean paid = body.containsKey("paid") ? (Boolean) body.get("paid") : null;
        Boolean processed = body.containsKey("processed") ? (Boolean) body.get("processed") : null;
        return ResponseEntity.ok(adminService.updateBetStatus(betId, paid, processed));
    }

    private String extractCity() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UsernamePasswordAuthenticationToken token) {
            if (token.getDetails() instanceof Claims claims) {
                String city = claims.get("city", String.class);
                return city != null ? city : "";
            }
        }
        return "";
    }
}
