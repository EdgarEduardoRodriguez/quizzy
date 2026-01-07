import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);

  // Agregar token de acceso si existe
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, userService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, userService: UserService): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      return userService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          isRefreshing = false;
          localStorage.setItem('access_token', tokenResponse.access);
          refreshTokenSubject.next(tokenResponse.access);
          const newReq = request.clone({
            setHeaders: {
              'Authorization': `Bearer ${tokenResponse.access}`
            }
          });
          return next(newReq);
        }),
        catchError((err) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          // Si el refresh falla, redirigir al login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Aquí podrías redirigir al login
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(accessToken => {
        const newReq = request.clone({
          setHeaders: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        return next(newReq);
      })
    );
  }
}
