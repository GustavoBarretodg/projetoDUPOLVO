package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.GameConfig;
import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.BetRepository;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BetService {

    private static final DateTimeFormatter BR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int MAX_RANDOM_ATTEMPTS = 30;

    private final BetRepository betRepository;
    private final UserRepository userRepository;
    private final PdfService pdfService;
    private final LoteriaResultadoService loteriaResultadoService;

    public BetService(BetRepository betRepository, UserRepository userRepository, PdfService pdfService,
                       LoteriaResultadoService loteriaResultadoService) {
        this.betRepository = betRepository;
        this.userRepository = userRepository;
        this.pdfService = pdfService;
        this.loteriaResultadoService = loteriaResultadoService;
    }

    public Map<String, Object> addBet(Long idBet, Long idUser, List<Integer> numbers, String gameType) {
        Map<String, Object> response = new HashMap<>();
        GameConfig config = GameConfig.fromString(gameType);

        for (int n : numbers) {
            if (n < config.min || n > config.max) {
                response.put("message", "invalid_number");
                response.put("detail", "Número " + n + " fora do intervalo " + config.min + "-" + config.max + " para " + config.displayName);
                return response;
            }
        }

        if (numbers.size() < config.minPick || numbers.size() > config.maxPick) {
            response.put("message", "invalid_count");
            response.put("detail", config.displayName + " requer entre " + config.minPick + " e " + config.maxPick + " números");
            return response;
        }

        List<Integer> sorted = new ArrayList<>(numbers);
        Collections.sort(sorted);

        // Checagem global: nenhum usuario (de nenhum admin/cidade) pode ter o mesmo
        // jogo com as mesmas dezenas, nao so o usuario que esta apostando agora.
        List<List<Integer>> existingCombos = existingCombosFor(config.name());
        if (isDuplicateCombo(sorted, existingCombos)) {
            response.put("message", "bet_exists");
            return response;
        }

        Bet bet = new Bet();
        bet.setIdBet(idBet);
        bet.setIdUser(idUser);
        bet.setBet(sorted);
        bet.setGameType(config.name());
        betRepository.save(bet);

        response.put("message", "bet_created");
        return response;
    }

    public Map<String, Object> addBetRandom(Long idBet, Long idUser, int qtdCard, String gameType) {
        Map<String, Object> response = new HashMap<>();
        GameConfig config = GameConfig.fromString(gameType);

        List<List<Integer>> existingCombos = existingCombosFor(config.name());
        int created = 0;

        for (int i = 0; i < qtdCard; i++) {
            List<Integer> numbers = null;
            for (int attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt++) {
                List<Integer> candidate = generateRandomNumbers(config.min, config.max, config.minPick);
                if (!isDuplicateCombo(candidate, existingCombos)) {
                    numbers = candidate;
                    break;
                }
            }
            if (numbers == null) continue; // nao conseguiu uma combinacao inedita, pula essa

            Bet bet = new Bet();
            bet.setIdBet(idBet);
            bet.setIdUser(idUser);
            bet.setBet(numbers);
            bet.setGameType(config.name());
            betRepository.save(bet);

            existingCombos.add(numbers);
            created++;
        }

        response.put("message", "bets_created");
        response.put("quantity", created);
        response.put("game", config.displayName);
        return response;
    }

    // Todas as combinacoes ja em uso pro jogo (fora cotas de bolao, que nao tem dezenas escolhidas pelo usuario).
    private List<List<Integer>> existingCombosFor(String gameType) {
        List<List<Integer>> combos = new ArrayList<>();
        for (Bet existing : betRepository.findByGameType(gameType)) {
            if (existing.getBolaoId() != null || existing.getBet() == null || existing.getBet().isEmpty()) continue;
            List<Integer> sorted = new ArrayList<>(existing.getBet());
            Collections.sort(sorted);
            combos.add(sorted);
        }
        return combos;
    }

    private boolean isDuplicateCombo(List<Integer> numbers, List<List<Integer>> existingCombos) {
        List<Integer> sorted = new ArrayList<>(numbers);
        Collections.sort(sorted);
        return existingCombos.contains(sorted);
    }

    public Map<String, Object> getBet(Long idUser) {
        Map<String, Object> response = new HashMap<>();
        List<Bet> bets = betRepository.findByIdUser(idUser);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Bet bet : bets) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", bet.getId());
            item.put("idBet", bet.getIdBet());
            item.put("idUser", bet.getIdUser());
            item.put("bet", bet.getBet());
            item.put("marked", bet.getMarked());
            item.put("gameType", bet.getGameType());
            item.put("bolaoId", bet.getBolaoId());
            item.put("bolaoName", bet.getBolaoName());
            item.put("quotaPrice", bet.getQuotaPrice());
            item.put("markedAt", bet.getMarkedAt());
            item.put("createdAt", bet.getCreatedAt());
            item.putAll(resolveResultInfo(bet));
            result.add(item);
        }

        response.put("data", result);
        return response;
    }

    // Como nao ha concurso vinculado a aposta, aproxima o sorteio "dela" pelo
    // ultimo resultado antes da data de criacao (sorteios saem por volta das
    // 20h): se a aposta foi criada antes desse horario, o sorteio ja saiu e
    // da pra contar os pontos; senao, ainda esta pendente pro proximo concurso.
    private Map<String, Object> resolveResultInfo(Bet bet) {
        Map<String, Object> info = new HashMap<>();
        info.put("resultStatus", "UNKNOWN");

        if (bet.getBolaoId() != null || bet.getBet() == null || bet.getBet().isEmpty() || bet.getCreatedAt() == null) {
            return info;
        }

        Map<String, Object> resultado = loteriaResultadoService.getLatest(bet.getGameType());
        if (resultado == null) {
            return info;
        }

        LocalDate lastDrawDate = parseBrDate((String) resultado.get("data"));
        if (lastDrawDate == null) {
            return info;
        }

        LocalDateTime lastDrawAt = lastDrawDate.atTime(20, 0);

        if (bet.getCreatedAt().isBefore(lastDrawAt)) {
            @SuppressWarnings("unchecked")
            List<String> dezenas = (List<String>) resultado.get("dezenas");
            int hits = (int) bet.getBet().stream()
                    .filter(n -> dezenas != null && dezenas.contains(String.format("%02d", n)))
                    .count();
            info.put("resultStatus", "AVAILABLE");
            info.put("concurso", resultado.get("concurso"));
            info.put("drawDate", resultado.get("data"));
            info.put("hits", hits);
        } else {
            info.put("resultStatus", "PENDING");
            info.put("nextDrawDate", resultado.get("dataProximoConcurso"));
        }

        return info;
    }

    private LocalDate parseBrDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value, BR_DATE);
        } catch (Exception e) {
            return null;
        }
    }

    public Map<String, Object> removeBet(Long idBet) {
        Map<String, Object> response = new HashMap<>();

        if (!betRepository.existsById(idBet)) {
            response.put("message", "bet_not_found");
            return response;
        }

        betRepository.deleteById(idBet);
        response.put("message", "bet_removed");
        return response;
    }

    public byte[] generateBetPdf(Long betId, Long requesterId) {
        Bet bet = betRepository.findById(betId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "bet_not_found"));

        if (!bet.getIdUser().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }

        User user = userRepository.findById(requesterId).orElse(null);
        return pdfService.generateBetCardPdf(bet, user);
    }

    public byte[] generateAllPendingBetsPdf(Long idUser) {
        List<Bet> pending = betRepository.findByIdUser(idUser).stream()
                .filter(b -> !Boolean.TRUE.equals(b.getMarked()))
                .collect(Collectors.toList());

        if (pending.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no_pending_bets");
        }

        User user = userRepository.findById(idUser).orElse(null);
        return pdfService.generatePendingSummaryPdf(pending, Collections.singletonMap(idUser, user), false);
    }

    private List<Integer> generateRandomNumbers(int min, int max, int count) {
        List<Integer> pool = new ArrayList<>();
        for (int i = min; i <= max; i++) pool.add(i);

        Collections.shuffle(pool);
        List<Integer> selected = pool.subList(0, count);
        List<Integer> result = new ArrayList<>(selected);
        Collections.sort(result);
        return result;
    }
}
