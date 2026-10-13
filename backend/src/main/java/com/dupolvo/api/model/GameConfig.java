package com.dupolvo.api.model;

public enum GameConfig {
    // gridColumns reproduz o numero de colunas do volante oficial da Caixa pra
    // cada jogo (confirmado pro formato 5x5 da Lotofacil, que e o unico jogo
    // liberado pra aposta hoje; os demais seguem o padrao usual de 10 linhas).
    MEGA_SENA("Mega-Sena", 1, 60, 6, 15, 6),
    LOTOFACIL("Lotofácil", 1, 25, 15, 20, 5),
    QUINA("Quina", 1, 80, 5, 15, 8),
    LOTOMANIA("Lotomania", 0, 99, 50, 50, 10),
    TIMEMANIA("Timemania", 1, 80, 10, 10, 8),
    DUPLA_SENA("Dupla Sena", 1, 50, 6, 15, 10),
    MILIONARIA("+Milionária", 1, 50, 6, 6, 10),
    DIA_DE_SORTE("Dia de Sorte", 1, 31, 7, 15, 7);

    public final String displayName;
    public final int min;
    public final int max;
    public final int minPick;
    public final int maxPick;
    public final int gridColumns;

    GameConfig(String displayName, int min, int max, int minPick, int maxPick, int gridColumns) {
        this.displayName = displayName;
        this.min = min;
        this.max = max;
        this.minPick = minPick;
        this.maxPick = maxPick;
        this.gridColumns = gridColumns;
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
