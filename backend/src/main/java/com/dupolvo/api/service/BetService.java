package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.GameConfig;
import com.dupolvo.api.repository.BetRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BetService {

    private final BetRepository betRepository;

    public BetService(BetRepository betRepository) {
        this.betRepository = betRepository;
    }

    public Map<String, Object> addBet(Long idBet, Long idUser, List<Integer> numbers, Boolean paid, String gameType) {
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

        List<Bet> userBets = betRepository.findByIdUser(idUser);
        for (Bet existing : userBets) {
            if (!config.name().equals(existing.getGameType())) continue;
            List<Integer> existingSorted = new ArrayList<>(existing.getBet());
            Collections.sort(existingSorted);
            if (existingSorted.equals(sorted)) {
                response.put("message", "bet_exists");
                return response;
            }
        }

        Bet bet = new Bet();
        bet.setIdBet(idBet);
        bet.setIdUser(idUser);
        bet.setBet(sorted);
        bet.setPaid(paid);
        bet.setGameType(config.name());
        betRepository.save(bet);

        response.put("message", "bet_created");
        return response;
    }

    public Map<String, Object> addBetRandom(Long idBet, Long idUser, int qtdCard, Boolean paid, String gameType) {
        Map<String, Object> response = new HashMap<>();
        GameConfig config = GameConfig.fromString(gameType);

        for (int i = 0; i < qtdCard; i++) {
            List<Integer> numbers = generateRandomNumbers(config.min, config.max, config.minPick);

            Bet bet = new Bet();
            bet.setIdBet(idBet);
            bet.setIdUser(idUser);
            bet.setBet(numbers);
            bet.setPaid(paid);
            bet.setGameType(config.name());
            betRepository.save(bet);
        }

        response.put("message", "bets_created");
        response.put("quantity", qtdCard);
        response.put("game", config.displayName);
        return response;
    }

    public Map<String, Object> getBet(Long idUser) {
        Map<String, Object> response = new HashMap<>();
        List<Bet> bets = betRepository.findByIdUser(idUser);
        response.put("data", bets);
        return response;
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
