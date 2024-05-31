import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Workflow, WorkflowResponse } from '../interfaces/workflow.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  constructor(private httpClient: HttpClient) {}

  private apiEndPoint = `${environment.apiUrl}/api/workflow`;

  getWorkflows(): Observable<Workflow[]> {
    return this.httpClient
      .get<WorkflowResponse>(this.apiEndPoint)
      .pipe(map(res => res.content));
  }
}
