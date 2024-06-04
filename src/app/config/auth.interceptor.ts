import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export const cookieInterceptor: HttpInterceptorFn = (req, next) => {
  const newReq = req.clone({ withCredentials: true });
  return next(newReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 0) {
        window.location.href = `${environment.BE_URL}/oauth2/authorization/okta`;
      }
      return throwError(() => err);
    })
  );
};
