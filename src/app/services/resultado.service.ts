import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../environments/environment';

export interface LoteriaResultado {
  concurso: number;
  data: string;
  dezenas: string[];
  acumulou: boolean;
  proximoConcurso: number;
  dataProximoConcurso: string;
  valorEstimadoProximoConcurso: number;
}

@Injectable({ providedIn: 'root' })
export class ResultadoService {
  constructor(private http: HttpClient) {}

  getResultado(gameKey: string) {
    return this.http.get<LoteriaResultado>(`${API_URL}/loterias/${gameKey}/resultado`);
  }
}
