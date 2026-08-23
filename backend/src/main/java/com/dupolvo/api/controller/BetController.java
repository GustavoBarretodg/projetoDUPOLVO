package com.dupolvo.api.controller;

import com.dupolvo.api.service.BetService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BetController {

    private final BetService betService;

    public BetController(BetService betService) {
        this.betService = betService;
    }

    @PostMapping("/add-bet")
    public ResponseEntity<Map<String, Object>> addBet(@RequestBody Map<String, Object> body) {
        Long idBet = Long.valueOf(body.get("id_bet").toString());
        Long idUser = Long.valueOf(body.get("id_user").toString());
        List<Integer> numbers = (List<Integer>) body.get("bet");
        String gameType = body.containsKey("game_type") ? body.get("game_type").toString() : "LOTOFACIL";
        return ResponseEntity.ok(betService.addBet(idBet, idUser, numbers, gameType));
    }

    @PostMapping("/add-bet-random")
    public ResponseEntity<Map<String, Object>> addBetRandom(@RequestBody Map<String, Object> body) {
        Long idBet = Long.valueOf(body.get("id_bet").toString());
        Long idUser = Long.valueOf(body.get("id_user").toString());
        int qtdCard = Integer.parseInt(body.get("qtd_card").toString());
        String gameType = body.containsKey("game_type") ? body.get("game_type").toString() : "LOTOFACIL";
        return ResponseEntity.ok(betService.addBetRandom(idBet, idUser, qtdCard, gameType));
    }

    @GetMapping("/get-bet")
    public ResponseEntity<Map<String, Object>> getBet(@RequestParam("id_user") Long idUser) {
        return ResponseEntity.ok(betService.getBet(idUser));
    }

    @PostMapping("/remove-bet")
    public ResponseEntity<Map<String, Object>> removeBet(@RequestBody Map<String, Object> body) {
        Long idBet = Long.valueOf(body.get("id_bet").toString());
        return ResponseEntity.ok(betService.removeBet(idBet));
    }

    @GetMapping("/get-bet-pdf")
    public ResponseEntity<byte[]> getBetPdf(@RequestParam("id_bet") Long idBet) {
        byte[] pdf = betService.generateBetPdf(idBet, extractUserId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cartao-" + idBet + ".pdf")
                .body(pdf);
    }

    private Long extractUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            try {
                return Long.valueOf(auth.getName());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
