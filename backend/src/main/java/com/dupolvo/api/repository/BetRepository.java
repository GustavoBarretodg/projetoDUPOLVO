package com.dupolvo.api.repository;

import com.dupolvo.api.model.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BetRepository extends JpaRepository<Bet, Long> {
    List<Bet> findByIdUser(Long idUser);
}
