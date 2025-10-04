import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {catchError, Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {JwtPayload, User} from '../model/user';
import {UserLogin} from '../model/user-login';
import {jwtDecode} from 'jwt-decode';
import {ResetPassword} from '../model/reset-password';
import {AuthResponse} from '../model/AuthResponse';
import {ChatNotificationRealtimeService} from './chat-notification-realtime.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  logoutSubject = new Subject<boolean>();
  loginSubject = new Subject<User>();
  private host = environment.apiUrl + '/auth';
  private authToken: string = '';
  private authUser: User | undefined;
  private principal: string = '';
  private jwtService = new JwtHelperService();
  private readonly token = 'token';

  constructor(private httpClient: HttpClient, private chatService: ChatNotificationRealtimeService) {
  }


  login(userLogin: UserLogin): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.host}/login`, userLogin).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }


  forgotPassword(email: string): Observable<any | HttpErrorResponse> {
    const reqParams = new HttpParams().set('email', email);
    return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/forgot-password`, null, {
      params: reqParams,
    });
  }

  resetPassword(token: string, resetPassword: ResetPassword): Observable<any | HttpErrorResponse> {
    return this.httpClient.post<any | HttpErrorResponse>(`${this.host}/reset-password/${token}`, resetPassword);
  }


  logout(): void {
    this.authToken = '';
    this.authUser = undefined;
    this.principal = '';
    localStorage.removeItem(this.token);
    this.logoutSubject.next(true);
    this.chatService.disconnect();
  }


  loadAuthTokenFromCache(): void {
    this.authToken = localStorage.getItem(this.token) ?? '';
  }

  storeAuthUserInCache(authUser: User): void {
    if (authUser != null) {
      this.authUser = authUser;
      localStorage.setItem('authUser', JSON.stringify(authUser));
    }
    this.loginSubject.next(authUser);
  }

  getAuthUserFromToken(): User | null {
    const userString = localStorage.getItem(this.token);
    return userString ? jwtDecode(userString) : null;
  }

  getUserFromLocalStorage(): User {
    const token = localStorage.getItem("token");
    const decoded: JwtPayload = token ? jwtDecode<any>(token) : {} as User;
    return {
      id: decoded?.id,
      firstName: decoded?.username,
      lastName: decoded?.lastname,
      profilePhoto: decoded?.avatarUrl
    } as User;
  }

  getAuthUserId(): number | null {
    const user = this.getAuthUserFromToken();
    return user ? user.id : null;
  }

  isUserLoggedIn(): boolean {
    this.loadAuthTokenFromCache();
    if (this.authToken != null && this.authToken != '') {
      if (this.jwtService.decodeToken(this.authToken).sub != null || '') {
        if (!this.jwtService.isTokenExpired(this.authToken)) {
          this.principal = this.jwtService.decodeToken(this.authToken).sub;
          return true;
        }
      }
    }
    this.logout();
    return false;
  }
}
