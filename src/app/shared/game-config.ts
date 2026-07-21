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
  MEGA_SENA:    { 6: 6.00, 7: 31.50, 8: 126.00, 9: 378.00, 10: 945.00, 11: 2079.00, 12: 4158.00, 13: 7722.00, 14: 13513.50, 15: 22522.50 },
  LOTOFACIL:    { 15: 3.50, 16: 56.00, 17: 476.00, 18: 2856.00, 19: 13566.00, 20: 54264.00 },
  QUINA:        { 5: 3.00, 6: 18.00, 7: 63.00, 8: 168.00, 9: 378.00, 10: 756.00, 11: 1386.00, 12: 2376.00, 13: 3861.00, 14: 6006.00, 15: 9009.00 },
  LOTOMANIA:    { 50: 3.00 },
  TIMEMANIA:    { 10: 3.50 },
  DUPLA_SENA:   { 6: 3.00, 7: 21.00, 8: 84.00, 9: 252.00, 10: 630.00, 11: 1386.00, 12: 2772.00, 13: 5148.00, 14: 9009.00, 15: 15015.00 },
  MILIONARIA:   { 6: 6.00 },
  DIA_DE_SORTE: { 7: 2.50, 8: 20.00, 9: 90.00, 10: 300.00, 11: 825.00, 12: 1980.00, 13: 4290.00, 14: 8580.00, 15: 16087.50 },
};

export function getBetPrice(gameKey: string, picks: number): number {
  const prices = GAME_PRICES[gameKey];
  if (!prices) return 0;
  return prices[picks] ?? 0;
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
