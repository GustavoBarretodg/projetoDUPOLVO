package com.dupolvo.api.controller;

import com.dupolvo.api.service.BetService;
import org.springframework.http.ResponseEntity;
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
        Boolean paid = Integer.valueOf(body.get("paid").toString()) == 1;
        String gameType = body.containsKey("game_type") ? body.get("game_type").toString() : "LOTOFACIL";
        return ResponseEntity.ok(betService.addBet(idBet, idUser, numbers, paid, gameType));
    }

    @PostMapping("/add-bet-random")
    public ResponseEntity<Map<String, Object>> addBetRandom(@RequestBody Map<String, Object> body) {
        Long idBet = Long.valueOf(body.get("id_bet").toString());
        Long idUser = Long.valueOf(body.get("id_user").toString());
        int qtdCard = Integer.parseInt(body.get("qtd_card").toString());
        Boolean paid = Integer.valueOf(body.get("paid").toString()) == 1;
        String gameType = body.containsKey("game_type") ? body.get("game_type").toString() : "LOTOFACIL";
        return ResponseEntity.ok(betService.addBetRandom(idBet, idUser, qtdCard, paid, gameType));
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
}
