package com.dupolvo.api.service;

import com.dupolvo.api.model.Bolao;
import com.dupolvo.api.model.BolaoParticipant;
import com.dupolvo.api.model.User;
import com.dupolvo.api.repository.BolaoParticipantRepository;
import com.dupolvo.api.repository.BolaoRepository;
import com.dupolvo.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BolaoService {

    private final BolaoRepository bolaoRepository;
    private final BolaoParticipantRepository participantRepository;
    private final UserRepository userRepository;

    public BolaoService(BolaoRepository bolaoRepository,
                        BolaoParticipantRepository participantRepository,
                        UserRepository userRepository) {
        this.bolaoRepository = bolaoRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> createBolao(Long adminId, String name, String gameType,
                                            Double pricePerQuota, Integer maxQuotas) {
        Map<String, Object> response = new HashMap<>();
        Bolao bolao = new Bolao();
        bolao.setName(name);
        bolao.setGameType(gameType);
        bolao.setPricePerQuota(pricePerQuota);
        bolao.setMaxQuotas(maxQuotas);
        bolao.setAdminId(adminId);
        bolaoRepository.save(bolao);
        response.put("message", "bolao_created");
        response.put("data", bolaoToMap(bolao, 0));
        return response;
    }

    public Map<String, Object> getAllOpen() {
        Map<String, Object> response = new HashMap<>();
        List<Bolao> bolaos = bolaoRepository.findByStatus("OPEN");
        List<Map<String, Object>> result = new ArrayList<>();
        for (Bolao b : bolaos) {
            int taken = participantRepository.countByBolaoId(b.getId());
            result.add(bolaoToMap(b, taken));
        }
        response.put("data", result);
        return response;
    }

    public Map<String, Object> joinBolao(Long bolaoId, Long userId) {
        Map<String, Object> response = new HashMap<>();
        Optional<Bolao> bolaoOpt = bolaoRepository.findById(bolaoId);
        if (bolaoOpt.isEmpty()) {
            response.put("message", "bolao_not_found");
            return response;
        }
        Bolao bolao = bolaoOpt.get();
        if (!"OPEN".equals(bolao.getStatus())) {
            response.put("message", "bolao_closed");
            return response;
        }
        if (participantRepository.findByBolaoIdAndUserId(bolaoId, userId).isPresent()) {
            response.put("message", "already_joined");
            return response;
        }
        int taken = participantRepository.countByBolaoId(bolaoId);
        if (taken >= bolao.getMaxQuotas()) {
            response.put("message", "bolao_full");
            return response;
        }
        Optional<User> userOpt = userRepository.findById(userId);
        BolaoParticipant participant = new BolaoParticipant();
        participant.setBolaoId(bolaoId);
        participant.setUserId(userId);
        participant.setUserName(userOpt.map(User::getName).orElse(""));
        participant.setUserEmail(userOpt.map(User::getEmail).orElse(""));
        participantRepository.save(participant);
        response.put("message", "joined");
        return response;
    }

    public Map<String, Object> getAdminBolaos(Long adminId) {
        Map<String, Object> response = new HashMap<>();
        List<Bolao> bolaos = bolaoRepository.findByAdminId(adminId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Bolao b : bolaos) {
            List<BolaoParticipant> participants = participantRepository.findByBolaoId(b.getId());
            Map<String, Object> item = bolaoToMap(b, participants.size());
            item.put("participants", participants);
            result.add(item);
        }
        response.put("data", result);
        return response;
    }

    public Map<String, Object> confirmParticipant(Long participantId) {
        Map<String, Object> response = new HashMap<>();
        Optional<BolaoParticipant> opt = participantRepository.findById(participantId);
        if (opt.isEmpty()) {
            response.put("message", "participant_not_found");
            return response;
        }
        BolaoParticipant p = opt.get();
        p.setStatus("CONFIRMED");
        participantRepository.save(p);
        response.put("message", "confirmed");
        return response;
    }

    public Map<String, Object> closeBolao(Long bolaoId) {
        Map<String, Object> response = new HashMap<>();
        Optional<Bolao> opt = bolaoRepository.findById(bolaoId);
        if (opt.isEmpty()) {
            response.put("message", "bolao_not_found");
            return response;
        }
        Bolao b = opt.get();
        b.setStatus("CLOSED");
        bolaoRepository.save(b);
        response.put("message", "bolao_closed");
        return response;
    }

    private Map<String, Object> bolaoToMap(Bolao b, int taken) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", b.getId());
        map.put("name", b.getName());
        map.put("gameType", b.getGameType());
        map.put("pricePerQuota", b.getPricePerQuota());
        map.put("maxQuotas", b.getMaxQuotas());
        map.put("status", b.getStatus());
        map.put("takenQuotas", taken);
        map.put("availableQuotas", b.getMaxQuotas() - taken);
        return map;
    }
}
