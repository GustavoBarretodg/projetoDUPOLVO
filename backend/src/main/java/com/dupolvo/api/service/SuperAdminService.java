package com.dupolvo.api.service;

import com.dupolvo.api.model.Bet;
import com.dupolvo.api.model.Bolao;
import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.BetRepository;
import com.dupolvo.api.repository.BolaoParticipantRepository;
import com.dupolvo.api.repository.BolaoRepository;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SuperAdminService {

    private final UserRepository userRepository;
    private final BetRepository betRepository;
    private final BolaoRepository bolaoRepository;
    private final BolaoParticipantRepository participantRepository;

    public SuperAdminService(UserRepository userRepository, BetRepository betRepository,
                              BolaoRepository bolaoRepository, BolaoParticipantRepository participantRepository) {
        this.userRepository = userRepository;
        this.betRepository = betRepository;
        this.bolaoRepository = bolaoRepository;
        this.participantRepository = participantRepository;
    }

    public Map<String, Object> getPendingAdmins() {
        Map<String, Object> response = new HashMap<>();
        List<User> pending = userRepository.findByRoleAndStatus("ADMIN", "PENDING");

        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : pending) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", u.getId());
            item.put("name", u.getName());
            item.put("email", u.getEmail());
            item.put("phone", u.getPhone());
            item.put("city", u.getCity());
            result.add(item);
        }

        response.put("data", result);
        return response;
    }

    public Map<String, Object> approveAdmin(Long userId, boolean approved) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            response.put("message", "user_not_found");
            return response;
        }

        User user = userOpt.get();
        user.setStatus(approved ? "ACTIVE" : "REJECTED");
        userRepository.save(user);

        response.put("message", approved ? "admin_approved" : "admin_rejected");
        return response;
    }

    // Aposta de bolao pertence ao admin que criou o bolao (mesmo se o
    // apostador for de outra cidade); aposta avulsa pertence ao admin da
    // cidade do apostador - por isso os dois blocos separados por admin,
    // em vez de uma metrica so.
    public Map<String, Object> getDashboard() {
        Map<String, Object> response = new HashMap<>();

        List<User> admins = userRepository.findByRoleAndStatus("ADMIN", "ACTIVE");
        List<Bolao> allBolaos = bolaoRepository.findAll();
        List<Bet> allBets = betRepository.findAll();
        Map<Long, User> userById = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<Map<String, Object>> result = new ArrayList<>();

        for (User admin : admins) {
            List<Bolao> adminBolaos = allBolaos.stream()
                    .filter(b -> admin.getId().equals(b.getAdminId()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> bolaosSold = new ArrayList<>();
            int bolaoParticipants = 0;
            for (Bolao b : adminBolaos) {
                int taken = participantRepository.countByBolaoId(b.getId());
                bolaoParticipants += taken;

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("bolaoId", b.getId());
                item.put("name", b.getName());
                item.put("quotasSold", taken);
                item.put("maxQuotas", b.getMaxQuotas());
                bolaosSold.add(item);
            }
            bolaosSold.sort((a, b) -> ((Integer) b.get("quotasSold")).compareTo((Integer) a.get("quotasSold")));

            List<Bet> directBetsInCity = allBets.stream()
                    .filter(bet -> bet.getBolaoId() == null)
                    .filter(bet -> {
                        User u = userById.get(bet.getIdUser());
                        return u != null && admin.getCity().equals(u.getCity());
                    })
                    .collect(Collectors.toList());
            long pendingBetsInCity = directBetsInCity.stream()
                    .filter(bet -> !Boolean.TRUE.equals(bet.getMarked()))
                    .count();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("adminId", admin.getId());
            entry.put("adminName", admin.getName());
            entry.put("city", admin.getCity());
            entry.put("bolaosSold", bolaosSold);
            entry.put("bolaoParticipants", bolaoParticipants);
            entry.put("directBetsInCity", directBetsInCity.size());
            entry.put("pendingBetsInCity", pendingBetsInCity);
            result.add(entry);
        }

        response.put("data", result);
        return response;
    }

    public Map<String, Object> resetUsers() {
        Map<String, Object> response = new HashMap<>();

        betRepository.deleteAll();

        List<User> nonSuperAdmins = userRepository.findByRoleNot("SUPER_ADMIN");
        userRepository.deleteAll(nonSuperAdmins);

        response.put("message", "database_reset");
        response.put("deleted_users", nonSuperAdmins.size());
        return response;
    }
}
