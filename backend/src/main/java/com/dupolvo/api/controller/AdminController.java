package com.dupolvo.api.controller;

import com.dupolvo.api.service.AdminService;
import org.springframework.http.ResponseEntity;
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
        return ResponseEntity.ok(adminService.getAllBets());
    }

    @PostMapping("/bet/status")
    public ResponseEntity<Map<String, Object>> updateBetStatus(@RequestBody Map<String, Object> body) {
        Long betId = Long.valueOf(body.get("bet_id").toString());
        Boolean paid = body.containsKey("paid") ? (Boolean) body.get("paid") : null;
        Boolean processed = body.containsKey("processed") ? (Boolean) body.get("processed") : null;
        return ResponseEntity.ok(adminService.updateBetStatus(betId, paid, processed));
    }
}
