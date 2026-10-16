import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private storage: StorageService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.storage.get('token')).pipe(
      switchMap(token => {
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Sessao expirada: remove so o login (o carrinho fica salvo) e
            // volta pra tela atual depois de entrar de novo.
            if (error.status === 401) {
              this.storage.removeItem('token');
              this.storage.removeItem('user');
              const returnUrl = this.router.url;
              this.router.navigate(['/login'], {
                queryParams: returnUrl && !returnUrl.startsWith('/login') ? { returnUrl } : {},
              });
            }
            return throwError(error);
          })
        );
      })
    );
  }
}
