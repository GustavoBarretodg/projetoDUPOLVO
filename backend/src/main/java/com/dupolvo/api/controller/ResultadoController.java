package com.dupolvo.api.controller;

import com.dupolvo.api.service.LotofacilResultadoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/lotofacil")
public class ResultadoController {

    private final LotofacilResultadoService resultadoService;

    public ResultadoController(LotofacilResultadoService resultadoService) {
        this.resultadoService = resultadoService;
    }

    @GetMapping("/resultado")
    public ResponseEntity<Map<String, Object>> getResultado() {
        Map<String, Object> resultado = resultadoService.getLatest();
        if (resultado == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resultado);
    }
}
