package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.BetRepository;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final BetRepository betRepository;
    private final UserRepository userRepository;

    public AdminService(BetRepository betRepository, UserRepository userRepository) {
        this.betRepository = betRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getAllBets(String adminCity) {
        Map<String, Object> response = new HashMap<>();

        List<User> cityUsers = userRepository.findByCity(adminCity);
        Set<Long> cityUserIds = cityUsers.stream().map(User::getId).collect(Collectors.toSet());

        List<Bet> bets = betRepository.findAll().stream()
                .filter(b -> cityUserIds.contains(b.getIdUser()))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        Map<Long, User> userCache = cityUsers.stream().collect(Collectors.toMap(User::getId, u -> u));

        for (Bet bet : bets) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", bet.getId());
            item.put("game_type", bet.getGameType());
            item.put("bet", bet.getBet());
            item.put("paid", bet.getPaid());
            item.put("processed", bet.getProcessed());
            item.put("paid_at", bet.getPaidAt());
            item.put("processed_at", bet.getProcessedAt());

            User u = userCache.get(bet.getIdUser());
            if (u != null) {
                item.put("user_name", u.getName());
                item.put("user_email", u.getEmail());
                item.put("user_phone", u.getPhone());
                item.put("user_city", u.getCity());
            }

            result.add(item);
        }

        response.put("data", result);
        return response;
    }

    public Map<String, Object> updateBetStatus(Long betId, Boolean paid, Boolean processed) {
        Map<String, Object> response = new HashMap<>();

        Optional<Bet> betOpt = betRepository.findById(betId);
        if (betOpt.isEmpty()) {
            response.put("message", "bet_not_found");
            return response;
        }

        Bet bet = betOpt.get();
        if (paid != null) {
            bet.setPaid(paid);
            bet.setPaidAt(paid ? LocalDateTime.now() : null);
        }
        if (processed != null) {
            bet.setProcessed(processed);
            bet.setProcessedAt(processed ? LocalDateTime.now() : null);
        }
        betRepository.save(bet);

        response.put("message", "bet_updated");
        return response;
    }
}
