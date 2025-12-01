import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/user';

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegisterPayload extends AuthCredentials {
  full_name: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'wch_current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: AuthCredentials): Observable<User> {
    return this.http
      .post<User>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(tap((user) => this.persistUser(user)));
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<User>(`${environment.apiBaseUrl}/auth/register`, payload)
      .pipe(tap((user) => this.persistUser(user)));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  private persistUser(user: User): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch (error) {
      console.warn('Unable to parse stored user', error);
      return null;
    }
  }
}

