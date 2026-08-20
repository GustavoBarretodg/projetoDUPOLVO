package com.dupolvo.api.controller;

import com.dupolvo.api.service.LoteriaResultadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/loterias")
public class LoteriaController {

    private final LoteriaResultadoService resultadoService;

    public LoteriaController(LoteriaResultadoService resultadoService) {
        this.resultadoService = resultadoService;
    }

    @GetMapping("/{gameKey}/resultado")
    public ResponseEntity<Map<String, Object>> getResultado(@PathVariable String gameKey) {
        Map<String, Object> resultado = resultadoService.getLatest(gameKey.toUpperCase());
        if (resultado == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resultado);
    }
}
