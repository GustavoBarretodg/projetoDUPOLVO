package com.dupolvo.api.controller;

import com.dupolvo.api.service.BolaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class BolaoController {

    private final BolaoService bolaoService;

    public BolaoController(BolaoService bolaoService) {
        this.bolaoService = bolaoService;
    }

    private Long getCurrentUserId() {
        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return Long.parseLong(auth.getName());
    }

    @GetMapping("/bolaos")
    public ResponseEntity<Map<String, Object>> getAllOpen() {
        return ResponseEntity.ok(bolaoService.getAllOpen());
    }

    @PostMapping("/bolaos/{id}/join")
    public ResponseEntity<Map<String, Object>> joinBolao(@PathVariable Long id) {
        return ResponseEntity.ok(bolaoService.joinBolao(id, getCurrentUserId()));
    }

    @GetMapping("/admin/bolaos")
    public ResponseEntity<Map<String, Object>> getAdminBolaos() {
        return ResponseEntity.ok(bolaoService.getAdminBolaos(getCurrentUserId()));
    }

    @PostMapping("/admin/bolaos")
    public ResponseEntity<Map<String, Object>> createBolao(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String gameType = (String) body.get("gameType");
        Double pricePerQuota = Double.parseDouble(body.get("pricePerQuota").toString());
        Integer maxQuotas = Integer.parseInt(body.get("maxQuotas").toString());
        return ResponseEntity.ok(bolaoService.createBolao(getCurrentUserId(), name, gameType, pricePerQuota, maxQuotas));
    }

    @PostMapping("/admin/bolaos/participants/{participantId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmParticipant(@PathVariable Long participantId) {
        return ResponseEntity.ok(bolaoService.confirmParticipant(participantId));
    }

    @PostMapping("/admin/bolaos/{id}/close")
    public ResponseEntity<Map<String, Object>> closeBolao(@PathVariable Long id) {
        return ResponseEntity.ok(bolaoService.closeBolao(id));
    }
}
