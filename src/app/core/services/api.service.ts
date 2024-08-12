import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, pluck } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPage } from '../models/page.model';
import { IWorkflowStep } from '../models/workflow-step';
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

  getWorkflows(pageParams: any): Observable<IPage<any>> {
    let params = new HttpParams()
      .set('page', pageParams.page)
      .set('pageSize', pageParams.pageSize)
      .set('sortBy', pageParams.sortBy)
      .set('order', pageParams.order);

    if (pageParams.search) {
      params = params.set('search', pageParams.search);
    }
    return this.http.get<IPage<any>>(`${this.apiUrl}/workflow`, { params });
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

  public getWorkflowInstanceDetails(id: number | unknown): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/workflowinstance/${id}`);
  }

  public updateWorkflow(
    workflowId: number | unknown,
    workflow: any
  ): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/workflow/${workflowId}`, workflow)
      .pipe(
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

  updateWorkflowInstanceStatus(
    instanceId: number,
    status: string
  ): Observable<any> {
    let params = new HttpParams().set('status', status);
    console.log(status);
    return this.http.put<any>(
      `${this.apiUrl}/workflowinstance/${instanceId}`,
      null,
      { params }
    );
  }

  public getWorkflowById(id: number | unknown): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/workflow/${id}`);
  }

  public getEmailsByWorkflowId(id: number | unknown): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/email/workflow/${id}`);
  }

  public deleteEmailById(id: number | unknown): Observable<string> {
    return this.http.delete(`${this.apiUrl}/email/${id}`, {
      responseType: 'text',
    });
  }

  public addEmail(id: number | any, bodyParams: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/email/${id}`, bodyParams);
  }

  public addTemplate(bodyParams: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/template`, bodyParams);
  }

  public updateEmail(id: number | any, bodyParams: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/email/${id}`, bodyParams);
  }

  public getWorkflowSteps(id: string, queryParams: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/workflow/${id}/steps`, {
      params: queryParams as any,
    });
  }

  public updateWorkflowSteps(
    id: string,
    workflowStep: IWorkflowStep
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/workflow/${id}/steps`,
      workflowStep
    );
  }

  public getTemplatesByTemplateId(
    id: number | any,
    queryParams: any
  ): Observable<IPage<any>> {
    return this.http.get<IPage<any>>(`${this.apiUrl}/template/${id}/versions`, {
      params: queryParams as any,
    });
  }

  public getAllTemplates(queryParams: any): Observable<IPage<any>> {
    return this.http.get<IPage<any>>(`${this.apiUrl}/template`, {
      params: queryParams as any,
    });
  }

  public updateTemplate(templateId: number | unknown, template: any) {
    console.log('template api-service', template);
    return this.http.put<any>(
      `${this.apiUrl}/template/${templateId}`,
      template
    );
  }

  getWorkflowStepConfigurations(workflowId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/workflow/${workflowId}/steps/configuration`
    );
  }
}
