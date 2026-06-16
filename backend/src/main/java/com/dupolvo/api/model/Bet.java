package com.dupolvo.api.model;

import com.dupolvo.api.converter.ListConverter;
import jakarta.persistence.*;
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
}
