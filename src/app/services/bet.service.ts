import { Injectable } from '@angular/core';
import { Bet } from '../shared/bet.interface';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { environment, API_URL } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class BetService {
    // headers = new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Headers': '*',
    //     'Accept': 'application/json, text/plain'  
    // });

    // options = {
    //   headers: this.headers
    // };

    constructor(
        public  httpClient : HttpClient,
    ) {

    }

    public addBet(params: Bet) {
        return this.httpClient.post<any>(`${API_URL}/add-bet`, params);
    }

    public getBet(params) {
        return this.httpClient.get<any>(`${API_URL}/get-bet`, { params: params });
    }

    public addBetRandom(params) {
        return this.httpClient.post<any>(`${API_URL}/add-bet-random`, params);
    }

    public removeBet(params) {
        return this.httpClient.post<any>(`${API_URL}/remove-bet`, params);
        
    }
}