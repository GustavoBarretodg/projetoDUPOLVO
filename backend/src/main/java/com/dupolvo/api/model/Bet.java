package com.dupolvo.api.model;

import com.dupolvo.api.converter.ListConverter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bets")
public class Bet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_bet")
    private Long idBet;

    @Column(name = "id_user", nullable = false)
    private Long idUser;

    @Convert(converter = ListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<Integer> bet;

    @Column(nullable = false)
    private Boolean paid = false;

    @Column(name = "game_type")
    private String gameType;

    @Column(name = "bolao_id")
    private Long bolaoId;

    @Column(name = "bolao_name")
    private String bolaoName;

    @Column(name = "quota_price")
    private Double quotaPrice;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean processed = false;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdBet() { return idBet; }
    public void setIdBet(Long idBet) { this.idBet = idBet; }

    public Long getIdUser() { return idUser; }
    public void setIdUser(Long idUser) { this.idUser = idUser; }

    public List<Integer> getBet() { return bet; }
    public void setBet(List<Integer> bet) { this.bet = bet; }

    public Boolean getPaid() { return paid; }
    public void setPaid(Boolean paid) { this.paid = paid; }

    public String getGameType() { return gameType; }
    public void setGameType(String gameType) { this.gameType = gameType; }

    public Long getBolaoId() { return bolaoId; }
    public void setBolaoId(Long bolaoId) { this.bolaoId = bolaoId; }

    public String getBolaoName() { return bolaoName; }
    public void setBolaoName(String bolaoName) { this.bolaoName = bolaoName; }

    public Double getQuotaPrice() { return quotaPrice; }
    public void setQuotaPrice(Double quotaPrice) { this.quotaPrice = quotaPrice; }

    public Boolean getProcessed() { return processed; }
    public void setProcessed(Boolean processed) { this.processed = processed; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
