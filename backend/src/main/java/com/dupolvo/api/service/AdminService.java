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
            item.put("marked", bet.getMarked());
            item.put("marked_at", bet.getMarkedAt());

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

    public Map<String, Object> updateUserPremium(Long userId, Boolean premium) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            response.put("message", "user_not_found");
            return response;
        }

        User user = userOpt.get();
        user.setPremium(premium);
        userRepository.save(user);

        response.put("message", "user_updated");
        return response;
    }

    public Map<String, Object> updateBetStatus(Long betId, Boolean marked) {
        Map<String, Object> response = new HashMap<>();

        Optional<Bet> betOpt = betRepository.findById(betId);
        if (betOpt.isEmpty()) {
            response.put("message", "bet_not_found");
            return response;
        }

        Bet bet = betOpt.get();
        bet.setMarked(marked);
        bet.setMarkedAt(marked ? LocalDateTime.now() : null);
        betRepository.save(bet);

        response.put("message", "bet_updated");
        return response;
    }
}
