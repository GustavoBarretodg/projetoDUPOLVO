import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BolaoService {
  constructor(private http: HttpClient) {}

  getAllOpen() {
    return this.http.get<any>(`${API_URL}/bolaos`);
  }

  joinBolao(id: number) {
    return this.http.post<any>(`${API_URL}/bolaos/${id}/join`, {});
  }

  createBolao(params: any) {
    return this.http.post<any>(`${API_URL}/admin/bolaos`, params);
  }

  getAdminBolaos() {
    return this.http.get<any>(`${API_URL}/admin/bolaos`);
  }

  confirmParticipant(participantId: number) {
    return this.http.post<any>(`${API_URL}/admin/bolaos/participants/${participantId}/confirm`, {});
  }

  closeBolao(id: number) {
    return this.http.post<any>(`${API_URL}/admin/bolaos/${id}/close`, {});
  }
}
