package com.dupolvo.api.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoteriaResultadoService {

    private static final Map<String, String> API_SLUGS = Map.of(
            "LOTOFACIL", "lotofacil",
            "MEGA_SENA", "megasena",
            "QUINA", "quina",
            "LOTOMANIA", "lotomania",
            "TIMEMANIA", "timemania",
            "DUPLA_SENA", "duplasena",
            "MILIONARIA", "maismilionaria",
            "DIA_DE_SORTE", "diadesorte"
    );

    private static final long CACHE_TTL_HOURS = 3;

    private final RestClient restClient = RestClient.create();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public Map<String, Object> getLatest(String gameKey) {
        String slug = API_SLUGS.get(gameKey);
        if (slug == null) return null;

        CacheEntry entry = cache.get(gameKey);
        if (entry != null && entry.cachedAt.isAfter(Instant.now().minus(CACHE_TTL_HOURS, ChronoUnit.HOURS))) {
            return entry.data;
        }

        try {
            RawResultado raw = restClient.get()
                    .uri("https://loteriascaixa-api.herokuapp.com/api/" + slug + "/latest")
                    .retrieve()
                    .body(RawResultado.class);

            if (raw == null || raw.dezenas == null) {
                return entry != null ? entry.data : null;
            }

            List<String> dezenas = raw.dezenas.stream().sorted().toList();

            Map<String, Object> data = Map.of(
                    "concurso", raw.concurso,
                    "data", raw.data,
                    "dezenas", dezenas,
                    "acumulou", raw.acumulou,
                    "proximoConcurso", raw.proximoConcurso,
                    "dataProximoConcurso", raw.dataProximoConcurso,
                    "valorEstimadoProximoConcurso", raw.valorEstimadoProximoConcurso
            );
            cache.put(gameKey, new CacheEntry(data, Instant.now()));
            return data;
        } catch (Exception e) {
            // API externa fora do ar - devolve o ultimo cache valido (pode ser null).
            return entry != null ? entry.data : null;
        }
    }

    private static class CacheEntry {
        final Map<String, Object> data;
        final Instant cachedAt;

        CacheEntry(Map<String, Object> data, Instant cachedAt) {
            this.data = data;
            this.cachedAt = cachedAt;
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
