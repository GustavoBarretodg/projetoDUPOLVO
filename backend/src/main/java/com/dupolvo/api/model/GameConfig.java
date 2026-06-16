package com.dupolvo.api.model;

public enum GameConfig {
    MEGA_SENA("Mega-Sena", 1, 60, 6, 15),
    LOTOFACIL("Lotofácil", 1, 25, 15, 20),
    QUINA("Quina", 1, 80, 5, 15),
    LOTOMANIA("Lotomania", 0, 99, 50, 50),
    TIMEMANIA("Timemania", 1, 80, 10, 10),
    DUPLA_SENA("Dupla Sena", 1, 50, 6, 15),
    MILIONARIA("+Milionária", 1, 50, 6, 6),
    DIA_DE_SORTE("Dia de Sorte", 1, 31, 7, 15);

    public final String displayName;
    public final int min;
    public final int max;
    public final int minPick;
    public final int maxPick;

    GameConfig(String displayName, int min, int max, int minPick, int maxPick) {
        this.displayName = displayName;
        this.min = min;
        this.max = max;
        this.minPick = minPick;
        this.maxPick = maxPick;
    }

    public static GameConfig fromString(String value) {
        if (value == null || value.isBlank()) return LOTOFACIL;
        try {
            return GameConfig.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LOTOFACIL;
        }
    }
}
