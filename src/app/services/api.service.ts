import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, pluck } from 'rxjs';
import { Workflow, WorkflowResponse } from '../interfaces/workflow.model';
import { environment } from 'src/environments/environment';
import {
  WorkflowInstance,
  WorkflowInstanceResponse,
} from '../interfaces/workflowinstance.model';
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

  public getWorkflows(queryParams: any): Observable<Workflow[]> {
    return this.http
      .get<WorkflowResponse>(`${this.apiUrl}/workflow`, {
        params: queryParams as any,
      })
      .pipe(pluck('content'));
  }

  public getWorkflowInstances(
    queryParams: any,
    id: number | unknown
  ): Observable<WorkflowInstance[]> {
    return this.http
      .get<WorkflowInstanceResponse>(
        `${this.apiUrl}/workflow/${id}/instances`,
        {
          params: queryParams as any,
        }
      )
      .pipe(pluck('content'));
  }

  public updateWorkflow(workflowId: number, status: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/workflow/${workflowId}`, status).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating workflow:', error);
        return of(null);
      })
    );
  }

  public getArtifacts(id: number | unknown): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/workflowinstance/${id}/artifacts`)
      .pipe(pluck('content'));
  }

  public getLogsForInstance(id: number | unknown): Observable<string> {
    return this.http.get(`${this.apiUrl}/workflowinstance/${id}/logs`, {
      responseType: 'text',
    });
  }
}
