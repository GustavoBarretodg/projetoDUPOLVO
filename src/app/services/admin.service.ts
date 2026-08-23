import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {}

  getAllBets() {
    return this.http.get<any>(`${API_URL}/admin/bets`);
  }

  updateBetStatus(betId: number, marked: boolean) {
    return this.http.post<any>(`${API_URL}/admin/bet/status`, { bet_id: betId, marked });
  }

  getBetPdf(betId: number) {
    return this.http.get(`${API_URL}/admin/bet/${betId}/pdf`, { responseType: 'blob' });
  }

  getAllPendingBetsPdf() {
    return this.http.get(`${API_URL}/admin/bets/pdf`, { responseType: 'blob' });
  }
}
