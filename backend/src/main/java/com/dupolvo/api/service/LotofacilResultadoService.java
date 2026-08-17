package com.dupolvo.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class LotofacilResultadoService {

    private static final String LATEST_URL = "https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest";
    private static final long CACHE_TTL_HOURS = 3;

    private final RestClient restClient = RestClient.create();

    private Map<String, Object> cached;
    private Instant cachedAt;

    public Map<String, Object> getLatest() {
        if (cached != null && cachedAt != null
                && cachedAt.isAfter(Instant.now().minus(CACHE_TTL_HOURS, ChronoUnit.HOURS))) {
            return cached;
        }

        try {
            RawResultado raw = restClient.get()
                    .uri(LATEST_URL)
                    .retrieve()
                    .body(RawResultado.class);

            if (raw == null || raw.dezenas == null) {
                return cached;
            }

            List<String> dezenas = raw.dezenas.stream().sorted().toList();

            cached = Map.of(
                    "concurso", raw.concurso,
                    "data", raw.data,
                    "dezenas", dezenas,
                    "acumulou", raw.acumulou,
                    "proximoConcurso", raw.proximoConcurso,
                    "dataProximoConcurso", raw.dataProximoConcurso,
                    "valorEstimadoProximoConcurso", raw.valorEstimadoProximoConcurso
            );
            cachedAt = Instant.now();
            return cached;
        } catch (Exception e) {
            // API externa fora do ar - devolve o ultimo cache valido (pode ser null).
            return cached;
        }
    }

    private static class RawResultado {
        public Integer concurso;
        public String data;
        public List<String> dezenas;
        public Boolean acumulou;
        public Integer proximoConcurso;
        public String dataProximoConcurso;
        public Double valorEstimadoProximoConcurso;
    }
}
