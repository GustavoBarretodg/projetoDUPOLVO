package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.Bolao;
import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.BetRepository;
import com.dupolvo.api.repository.BolaoRepository;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final BetRepository betRepository;
    private final UserRepository userRepository;
    private final BolaoRepository bolaoRepository;

    public AdminService(BetRepository betRepository, UserRepository userRepository, BolaoRepository bolaoRepository) {
        this.betRepository = betRepository;
        this.userRepository = userRepository;
        this.bolaoRepository = bolaoRepository;
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

    public Map<String, Object> updateUserPremium(Long userId, Boolean premium, String adminCity) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            response.put("message", "user_not_found");
            return response;
        }

        User user = userOpt.get();
        if (adminCity == null || adminCity.isBlank() || !adminCity.equals(user.getCity())) {
            response.put("message", "forbidden");
            return response;
        }

        user.setPremium(premium);
        userRepository.save(user);

        response.put("message", "user_updated");
        return response;
    }

    public Map<String, Object> updateBetStatus(Long betId, Boolean marked, Long adminId, String adminCity) {
        Map<String, Object> response = new HashMap<>();

        Optional<Bet> betOpt = betRepository.findById(betId);
        if (betOpt.isEmpty()) {
            response.put("message", "bet_not_found");
            return response;
        }

        Bet bet = betOpt.get();
        if (!ownsBet(bet, adminId, adminCity)) {
            response.put("message", "forbidden");
            return response;
        }

        bet.setMarked(marked);
        bet.setMarkedAt(marked ? LocalDateTime.now() : null);
        betRepository.save(bet);

        response.put("message", "bet_updated");
        return response;
    }

    // Aposta de bolao pertence ao admin que criou o bolao (mesmo se o
    // apostador for de outra cidade); aposta avulsa pertence ao admin da
    // cidade do apostador. So vale pra role ADMIN - SUPER_ADMIN nao chama
    // esse endpoint hoje (bloqueado antes mesmo, no filtro de seguranca).
    private boolean ownsBet(Bet bet, Long adminId, String adminCity) {
        if (bet.getBolaoId() != null) {
            Optional<Bolao> bolaoOpt = bolaoRepository.findById(bet.getBolaoId());
            return bolaoOpt.isPresent() && bolaoOpt.get().getAdminId() != null
                    && bolaoOpt.get().getAdminId().equals(adminId);
        }

        if (adminCity == null || adminCity.isBlank()) {
            return false;
        }
        Optional<User> userOpt = userRepository.findById(bet.getIdUser());
        return userOpt.isPresent() && adminCity.equals(userOpt.get().getCity());
    }
}
