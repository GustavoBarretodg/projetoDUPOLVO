package com.dupolvo.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bolaos")
public class Bolao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "game_type", nullable = false)
    private String gameType;

    @Column(name = "price_per_quota", nullable = false)
    private Double pricePerQuota;

    @Column(name = "max_quotas", nullable = false)
    private Integer maxQuotas;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'OPEN'")
    private String status = "OPEN";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGameType() { return gameType; }
    public void setGameType(String gameType) { this.gameType = gameType; }

    public Double getPricePerQuota() { return pricePerQuota; }
    public void setPricePerQuota(Double pricePerQuota) { this.pricePerQuota = pricePerQuota; }

    public Integer getMaxQuotas() { return maxQuotas; }
    public void setMaxQuotas(Integer maxQuotas) { this.maxQuotas = maxQuotas; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
