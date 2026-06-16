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
  MEGA_SENA:   { key: 'MEGA_SENA',   name: 'Mega-Sena',    min: 1,  max: 60, minPick: 6,  maxPick: 15, icon: 'trophy-outline',   color: '#209869' },
  LOTOFACIL:   { key: 'LOTOFACIL',   name: 'Lotofácil',    min: 1,  max: 25, minPick: 15, maxPick: 20, icon: 'heart-outline',    color: '#930089' },
  QUINA:       { key: 'QUINA',       name: 'Quina',         min: 1,  max: 80, minPick: 5,  maxPick: 15, icon: 'star-outline',     color: '#260085' },
  LOTOMANIA:   { key: 'LOTOMANIA',   name: 'Lotomania',     min: 0,  max: 99, minPick: 50, maxPick: 50, icon: 'apps-outline',     color: '#F78B00' },
  TIMEMANIA:   { key: 'TIMEMANIA',   name: 'Timemania',     min: 1,  max: 80, minPick: 10, maxPick: 10, icon: 'football-outline', color: '#00B594' },
  DUPLA_SENA:  { key: 'DUPLA_SENA',  name: 'Dupla Sena',    min: 1,  max: 50, minPick: 6,  maxPick: 15, icon: 'copy-outline',     color: '#A30000' },
  MILIONARIA:  { key: 'MILIONARIA',  name: '+Milionária',   min: 1,  max: 50, minPick: 6,  maxPick: 6,  icon: 'diamond-outline',  color: '#006400' },
  DIA_DE_SORTE:{ key: 'DIA_DE_SORTE',name: 'Dia de Sorte',  min: 1,  max: 31, minPick: 7,  maxPick: 15, icon: 'sunny-outline',    color: '#CB7400' },
};

export const GAME_LIST: GameConfig[] = Object.values(GAME_CONFIGS);
