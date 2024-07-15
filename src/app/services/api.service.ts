import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, pluck } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPage } from '../interfaces/page.model';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.BE_URL}/api`;
  private logoutUrl = `${environment.BE_URL}`;
  constructor(private http: HttpClient) {}

  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  logOut(): Observable<any> {
    return this.http.get<any>(`${this.logoutUrl}/logout`);
  }

  isAuthenticated(): Observable<boolean> {
    return this.getUserDetails().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  public getWorkflows(queryParams: any): Observable<IPage<any>> {
    return this.http.get<IPage<any>>(`${this.apiUrl}/workflow`, {
      params: queryParams as any,
    });
  }

  public getInstancesByStatus(queryParams: any): Observable<IPage<any>> {
    return this.http.get<IPage<any>>(`${this.apiUrl}/workflowinstance`, {
      params: queryParams as any,
    });
  }

  public getWorkflowInstances(
    queryParams: any,
    id: number | unknown,
    identifier: any
  ): Observable<IPage<any>> {
    let params = new HttpParams();
    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        params = params.set(key, queryParams[key]);
      }
    }

    if (identifier) {
      params = params.set('identifier', identifier);
    }

    return this.http.get<IPage<any>>(
      `${this.apiUrl}/workflow/${id}/instances`,
      {
        params,
      }
    );
  }

  public getWorkflowInstance(id: number): Observable<any> {
    console.log('gert instance');
    return this.http.get<any>(`${this.apiUrl}/workflowinstance/${id}`);
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

  public downloadArtifact(artifactId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/artifact/${artifactId}`, {
      responseType: 'blob',
    });
  }
}
