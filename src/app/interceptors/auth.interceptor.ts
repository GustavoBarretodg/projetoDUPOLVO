import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private storage: StorageService, private session: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.storage.get('token')).pipe(
      switchMap(token => {
        // Token vencido nem vai pro backend: encerra a sessao aqui e manda a
        // requisicao sem ele (rota publica responde normal; protegida da 401).
        if (token && this.session.isTokenExpired(token)) {
          this.session.expireSession();
          token = null;
        }

        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Sessao recusada pelo backend (vencida, ou segredo do JWT trocado).
            if (error.status === 401) {
              this.session.expireSession();
            }
            return throwError(error);
          })
        );
      })
    );
  }
}
