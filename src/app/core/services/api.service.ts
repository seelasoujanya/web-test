import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, pluck } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPage } from '../models/page.model';
import { IWorkflowStep } from '../models/workflow-step';
import {
  SystemPropertiesDTO,
  SystemProperty,
  WorkflowConfiguration,
} from '../models/workflow.model';
import { StatsDTO } from '../models/workflowinstance.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  updateOrCreateWorkflowConfiguration(
    workflowId: number,
    configuration: any
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/workflow/${workflowId}/configs`,
      configuration
    );
  }

  getWorkflowConfigurations(
    workflowId: number
  ): Observable<WorkflowConfiguration[]> {
    return this.http.get<WorkflowConfiguration[]>(
      `${this.apiUrl}/workflow/${workflowId}/configs`
    );
  }
  getPausedProperty(key: string) {
    return this.http.get<any>(`${this.apiUrl}/property/${key}`);
  }

  updateSystemProperty(
    id: number | undefined,
    dto: SystemPropertiesDTO
  ): Observable<SystemProperty> {
    return this.http.put<SystemProperty>(`${this.apiUrl}/property/${id}`, dto);
  }

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

  getWorkflowsStatistics(id: number): Observable<StatsDTO> {
    return this.http.get<StatsDTO>(`${this.apiUrl}/workflow/${id}/stats`);
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

  updateWorkflowInstance(id: number, updateData: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/workflowinstance/${id}`,
      updateData
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

  public getWorkflowSteps(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/workflow/${id}/steps`);
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

  getSelectedTemplate(workflowId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/template/workflow/${workflowId}`);
  }

  postTemplateForStep(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/workflow/template`, body);
  }

  bookmarkWorkflow(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookmark`, body);
  }

  getBookmarksByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookmark/user/${username}`);
  }

  getBookmarkedWorkflowsByUsername(
    username: string,
    pageParams: any
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', pageParams.page)
      .set('pageSize', pageParams.pageSize)
      .set('sortBy', pageParams.sortBy)
      .set('order', pageParams.order);
    if (pageParams.search) {
      params = params.set('search', pageParams.search);
    }
    return this.http.get<any>(
      `${this.apiUrl}/bookmark/user/${username}/workflows`,
      { params }
    );
  }

  public removeBookmark(
    workflowId: number,
    userName: string
  ): Observable<string> {
    const params = new HttpParams()
      .set('workflowId', workflowId)
      .set('username', userName);
    return this.http.delete(`${this.apiUrl}/bookmark`, {
      params: params,
      responseType: 'text',
    });
  }
}
