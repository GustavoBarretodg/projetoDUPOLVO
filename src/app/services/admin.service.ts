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

  updateBetStatus(betId: number, paid?: boolean, processed?: boolean) {
    const body: any = { bet_id: betId };
    if (paid !== undefined) body.paid = paid;
    if (processed !== undefined) body.processed = processed;
    return this.http.post<any>(`${API_URL}/admin/bet/status`, body);
  }
}
