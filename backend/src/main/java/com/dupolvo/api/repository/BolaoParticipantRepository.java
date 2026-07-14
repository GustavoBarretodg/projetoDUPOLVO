package com.dupolvo.api.repository;

import com.dupolvo.api.model.BolaoParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BolaoParticipantRepository extends JpaRepository<BolaoParticipant, Long> {
    List<BolaoParticipant> findByBolaoId(Long bolaoId);
    Optional<BolaoParticipant> findByBolaoIdAndUserId(Long bolaoId, Long userId);
    int countByBolaoId(Long bolaoId);
}
