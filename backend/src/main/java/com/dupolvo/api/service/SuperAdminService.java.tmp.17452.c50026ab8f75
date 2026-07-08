package com.dupolvo.api.service;

import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.BetRepository;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SuperAdminService {

    private final UserRepository userRepository;
    private final BetRepository betRepository;

    public SuperAdminService(UserRepository userRepository, BetRepository betRepository) {
        this.userRepository = userRepository;
        this.betRepository = betRepository;
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
