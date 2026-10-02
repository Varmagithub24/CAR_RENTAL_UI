import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

function isApplicationApi(url: string): boolean {
  try {
    const target = new URL(url, window.location.origin);
    const api = new URL(environment.apiUrl, window.location.origin);
    return target.origin === api.origin && target.pathname.startsWith(`${api.pathname}/`);
  } catch {
    return false;
  }
}

export const apiSecurityInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApi = isApplicationApi(request.url);
  const isPublicAuthRequest = request.url.includes('/auth/');
  const accessToken = isApi && !isPublicAuthRequest ? auth.accessToken() : null;
  const outgoing = accessToken
    ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (isApi && !isPublicAuthRequest && error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          return auth.refreshSession().pipe(
            switchMap((token) => {
              if (token) {
                return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
              }
              auth.clearSession();
              void router.navigateByUrl('/sign-in');
              return throwError(() => error);
            }),
          );
        } else if (error.status === 403) {
          void router.navigateByUrl('/forbidden');
        }
      }
      return throwError(() => error);
    }),
  );
};