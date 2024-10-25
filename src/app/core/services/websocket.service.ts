import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketAPI {
  private client!: Client;
  private isConnected = false;
  private apiUrl = `${environment.BE_URL}`;
  public totalWorkflowsStatusCounts = new BehaviorSubject<any>(null);
  public statusCountByWorkflow = new BehaviorSubject<any>(null);

  constructor() {
    this.connect();
  }

  private connect() {
    if (!this.isConnected) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${this.apiUrl}/ws`),
        reconnectDelay: 5000,
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        this.subscribeToWorkflowStatusCounts();
        this.subscribeToWorkflowUpdaeteds();
      };

      this.client.onStompError = frame => {
        console.error(`Broker error: ${frame.headers['message']}`);
        console.error(`Additional details: ${frame.body}`);
      };

      this.client.activate();
    }
  }

  private subscribeToWorkflowStatusCounts() {
    this.client.subscribe('/topic/workflow-status-counts', message => {
      const statusCounts = JSON.parse(message.body);
      this.totalWorkflowsStatusCounts.next(statusCounts);
    });
  }

  private subscribeToWorkflowUpdaeteds() {
    this.client.subscribe('/topic/workflow-updates', message => {
      const statusCounts = JSON.parse(message.body);
      this.statusCountByWorkflow.next(statusCounts);
    });
  }

  public disconnect() {
    if (this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }
}
