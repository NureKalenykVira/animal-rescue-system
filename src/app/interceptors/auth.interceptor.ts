import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const authReq = token
    ? req.clone({ setHeaders: { 'x-token': token } })
    : req;
  return next(authReq);
};

