import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Authentication } from 'src/app/shared/Interfaces/authentication.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSubject: BehaviorSubject<Authentication>;
  public user$: Observable<Authentication>;

  constructor(private http: HttpClient) {
    this.userSubject = new BehaviorSubject<Authentication>(JSON.parse(localStorage.getItem('user')));
    this.user$ = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  signIn(data: Authentication): Observable<Authentication> {
    return this.http.post<Authentication>(`${environment.apiUrl}/auth/signin`, data).pipe(
      map(({ accessToken }) => {
        const payload = this.decodeToken(accessToken);
        if (payload.role >= 1) {
          const user = { ...payload, accessToken };
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
          return user;
        }
        return false;
      })
    );
  }

  signUp(data: Authentication): Observable<Authentication> {
    return this.http.post<Authentication>(`${environment.apiUrl}/auth/signup`, data);
  }

  signOut() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  decodeToken(accessToken: string) {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
  }
}