import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../environments/environment';

export interface LotofacilResultado {
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

  getLotofacilLatest() {
    return this.http.get<LotofacilResultado>(`${API_URL}/lotofacil/resultado`);
  }
}
