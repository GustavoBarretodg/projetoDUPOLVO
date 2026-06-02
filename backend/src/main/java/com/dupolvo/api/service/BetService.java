package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.repository.BetRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BetService {

    private final BetRepository betRepository;

    public BetService(BetRepository betRepository) {
        this.betRepository = betRepository;
    }

    public Map<String, Object> addBet(Long idBet, Long idUser, List<Integer> numbers, Boolean paid) {
        Map<String, Object> response = new HashMap<>();

        List<Integer> sorted = new ArrayList<>(numbers);
        Collections.sort(sorted);

        List<Bet> userBets = betRepository.findByIdUser(idUser);
        for (Bet existing : userBets) {
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
        betRepository.save(bet);

        response.put("message", "bet_created");
        return response;
    }

    public Map<String, Object> addBetRandom(Long idBet, Long idUser, int qtdCard, Boolean paid) {
        Map<String, Object> response = new HashMap<>();

        for (int i = 0; i < qtdCard; i++) {
            List<Integer> numbers = generateRandomNumbers(1, 25, 15);

            Bet bet = new Bet();
            bet.setIdBet(idBet);
            bet.setIdUser(idUser);
            bet.setBet(numbers);
            bet.setPaid(paid);
            betRepository.save(bet);
        }

        response.put("message", "bets_created");
        response.put("quantity", qtdCard);
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
