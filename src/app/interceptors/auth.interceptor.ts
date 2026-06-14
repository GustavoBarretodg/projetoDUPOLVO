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
            if (error.status === 401) {
              this.storage.clear();
              this.router.navigate(['/login']);
            }
            return throwError(error);
          })
        );
      })
    );
  }
}
