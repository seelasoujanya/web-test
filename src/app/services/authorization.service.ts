import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.BE_URL}`;

  getCsrfToken(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/csrf`);
  }
}
