package com.dupolvo.api.repository;

import com.dupolvo.api.model.Bolao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BolaoRepository extends JpaRepository<Bolao, Long> {
    List<Bolao> findByStatus(String status);
    List<Bolao> findByAdminId(Long adminId);
}
