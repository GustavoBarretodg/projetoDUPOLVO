export interface GameConfig {
  key: string;
  name: string;
  min: number;
  max: number;
  minPick: number;
  maxPick: number;
  icon: string;
  color: string;
}

export const GAME_CONFIGS: { [key: string]: GameConfig } = {
  MEGA_SENA:    { key: 'MEGA_SENA',    name: 'Mega-Sena',    min: 1,  max: 60, minPick: 6,  maxPick: 15, icon: 'trophy-outline',   color: '#209869' },
  LOTOFACIL:    { key: 'LOTOFACIL',    name: 'Lotofácil',    min: 1,  max: 25, minPick: 15, maxPick: 20, icon: 'heart-outline',    color: '#930089' },
  QUINA:        { key: 'QUINA',        name: 'Quina',         min: 1,  max: 80, minPick: 5,  maxPick: 15, icon: 'star-outline',     color: '#260085' },
  LOTOMANIA:    { key: 'LOTOMANIA',    name: 'Lotomania',     min: 0,  max: 99, minPick: 50, maxPick: 50, icon: 'apps-outline',     color: '#F78B00' },
  TIMEMANIA:    { key: 'TIMEMANIA',    name: 'Timemania',     min: 1,  max: 80, minPick: 10, maxPick: 10, icon: 'football-outline', color: '#00B594' },
  DUPLA_SENA:   { key: 'DUPLA_SENA',  name: 'Dupla Sena',    min: 1,  max: 50, minPick: 6,  maxPick: 15, icon: 'copy-outline',     color: '#A30000' },
  MILIONARIA:   { key: 'MILIONARIA',  name: '+Milionária',   min: 1,  max: 50, minPick: 6,  maxPick: 6,  icon: 'diamond-outline',  color: '#006400' },
  DIA_DE_SORTE: { key: 'DIA_DE_SORTE',name: 'Dia de Sorte',  min: 1,  max: 31, minPick: 7,  maxPick: 15, icon: 'sunny-outline',    color: '#CB7400' },
};

export const GAME_LIST: GameConfig[] = Object.values(GAME_CONFIGS);

// Preços oficiais da Caixa por jogo e quantidade de dezenas marcadas
export const GAME_PRICES: { [gameKey: string]: { [picks: number]: number } } = {
  MEGA_SENA:    { 6: 5.00, 7: 35.00, 8: 140.00, 9: 420.00, 10: 1050.00, 11: 2310.00, 12: 4620.00, 13: 8580.00, 14: 15015.00, 15: 25025.00 },
  LOTOFACIL:    { 15: 3.00, 16: 48.00, 17: 408.00, 18: 2448.00, 19: 11628.00, 20: 46512.00 },
  QUINA:        { 5: 2.00, 6: 12.00, 7: 42.00, 8: 112.00, 9: 252.00, 10: 504.00, 11: 924.00, 12: 1848.00, 13: 3276.00, 14: 5460.00, 15: 6435.00 },
  LOTOMANIA:    { 50: 3.00 },
  TIMEMANIA:    { 10: 3.50 },
  DUPLA_SENA:   { 6: 2.50, 7: 17.50, 8: 70.00, 9: 210.00, 10: 525.00, 11: 1155.00, 12: 2310.00, 13: 4290.00, 14: 7507.50, 15: 12512.50 },
  MILIONARIA:   { 6: 6.00 },
  DIA_DE_SORTE: { 7: 3.00, 8: 24.00, 9: 144.00, 10: 720.00, 11: 2880.00, 12: 9360.00, 13: 25740.00, 14: 58968.00, 15: 118404.00 },
};

export function getBetPrice(gameKey: string, picks: number): number {
  const prices = GAME_PRICES[gameKey];
  if (!prices) return 0;
  return prices[picks] ?? 0;
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
