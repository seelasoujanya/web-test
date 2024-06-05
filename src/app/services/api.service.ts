import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Workflow, WorkflowResponse } from '../interfaces/workflow.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.BE_URL}/api`;
  constructor(private http: HttpClient) {}

  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  isAuthenticated(): Observable<boolean> {
    return this.getUserDetails().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  getWorkflows(): Observable<Workflow[]> {
    return this.http
      .get<WorkflowResponse>(`${this.apiUrl}/workflow`)
      .pipe(map(res => res.content));
  }
}
