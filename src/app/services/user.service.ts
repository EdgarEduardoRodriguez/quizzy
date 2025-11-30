import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // Headers para las peticiones
  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Método para registrar usuario
  register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData, {
      headers: this.getHeaders()
    });
  }

  // Método para login con JWT
  login(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/token/`, credentials, {
      headers: this.getHeaders()
    });
  }

  // Método para refrescar token JWT
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/token/refresh/`, {
      refresh: refreshToken
    }, {
      headers: this.getHeaders()
    });
  }
}
