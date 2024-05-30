import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  constructor(private httpClient: HttpClient) {}

  private apiEndPoint = `${environment.apiUrl}/api/workflow`;

  getWorkflows(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiEndPoint);
  }
}
