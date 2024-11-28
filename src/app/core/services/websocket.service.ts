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
  public pausedStatus = new BehaviorSubject<any>(null);

  constructor() {
    this.connect();
  }

  private connect() {
    if (!this.isConnected) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${this.apiUrl}/ws`),
        reconnectDelay: 10000,
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        console.log('WebSocket connected successfully');
        this.subscribeToWorkflowStatusCounts();
        this.subscribeToWorkflowUpdates();
        this.subscribeToPausedStatus();
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
      try {
        const statusCounts = JSON.parse(message.body);
        this.totalWorkflowsStatusCounts.next(statusCounts);
      } catch (error) {
        console.error('Error parsing workflow status counts:', error);
      }
    });
  }

  private subscribeToPausedStatus() {
    this.client.subscribe('/topic/paused-status', message => {
      try {
        const pausedStatus = JSON.parse(message.body);
        console.log('Paused status received:', pausedStatus);
        this.pausedStatus.next(pausedStatus);
      } catch (error) {
        console.error('Error parsing paused status:', error);
      }
    });
  }

  private subscribeToWorkflowUpdates() {
    this.client.subscribe('/topic/workflow-updates', message => {
      try {
        const statusCounts = JSON.parse(message.body);
        this.statusCountByWorkflow.next(statusCounts);
      } catch (error) {
        console.error('Error parsing workflow updates:', error);
      }
    });
  }

  public disconnect() {
    if (this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('WebSocket disconnected successfully');
    }
  }
}
