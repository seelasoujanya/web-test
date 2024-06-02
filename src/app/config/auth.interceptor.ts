import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const cookieInterceptor: HttpInterceptorFn = (req, next) => {
  const newReq = req.clone({ withCredentials: true });
  return next(newReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // window.location.href = '/login';
      }
      return throwError(() => err);
    })
  );
};
