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

    @Column(name = "paid", nullable = false)
    private Boolean marked = false;

    @Column(name = "game_type")
    private String gameType;

    @Column(name = "bolao_id")
    private Long bolaoId;

    @Column(name = "bolao_name")
    private String bolaoName;

    @Column(name = "quota_price")
    private Double quotaPrice;

    @Column(name = "paid_at")
    private LocalDateTime markedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdBet() { return idBet; }
    public void setIdBet(Long idBet) { this.idBet = idBet; }

    public Long getIdUser() { return idUser; }
    public void setIdUser(Long idUser) { this.idUser = idUser; }

    public List<Integer> getBet() { return bet; }
    public void setBet(List<Integer> bet) { this.bet = bet; }

    public Boolean getMarked() { return marked; }
    public void setMarked(Boolean marked) { this.marked = marked; }

    public String getGameType() { return gameType; }
    public void setGameType(String gameType) { this.gameType = gameType; }

    public Long getBolaoId() { return bolaoId; }
    public void setBolaoId(Long bolaoId) { this.bolaoId = bolaoId; }

    public String getBolaoName() { return bolaoName; }
    public void setBolaoName(String bolaoName) { this.bolaoName = bolaoName; }

    public Double getQuotaPrice() { return quotaPrice; }
    public void setQuotaPrice(Double quotaPrice) { this.quotaPrice = quotaPrice; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }
}
