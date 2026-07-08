import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuperAdminService {

  constructor(private http: HttpClient) {}

  getPendingAdmins() {
    return this.http.get<any>(`${API_URL}/superadmin/pending-admins`);
  }

  approveAdmin(userId: number, approved: boolean) {
    return this.http.post<any>(`${API_URL}/superadmin/approve-admin`, { user_id: userId, approved });
  }

  resetUsers() {
    return this.http.delete<any>(`${API_URL}/superadmin/reset-users`);
  }
}
