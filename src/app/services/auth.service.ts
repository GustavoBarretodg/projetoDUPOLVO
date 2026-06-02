import { Injectable } from '@angular/core';
import { User } from '../shared/user.interface';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { environment, API_URL } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    headers = new HttpHeaders({     
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',     
        'Access-Control-Allow-Headers': '*',
        'Accept': 'application/json, text/plain'  
    });

    options = {
      headers: this.headers
    };

    constructor(
        public  httpClient : HttpClient,
    ) {

    }

    public login(params: User) {
        return this.httpClient.post<any>(`${API_URL}/login`, params);
    }

    public register(params: User) {
        return this.httpClient.post<any>(`${API_URL}/register`, params);
    }


//   async logout(): Promise<void> {
//     try {
//       await this.afAuth.signOut();
//     } catch (error) {
//       //console.log('Error->', error);
//       this.toastMessages('Falha ao efetuar logout.');
//     }
//   }

}