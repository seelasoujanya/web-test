import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, Stomp, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { AuthorizationService } from '../services/authorization.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketAPI {
  public client!: Client;
  private isConnected = false;
  public isWsConnectionReady = new BehaviorSubject<boolean>(false);
  private apiUrl = `${environment.BE_URL}`;

  private updatedWorkflowInstances = new BehaviorSubject<any>(null);

  constructor(private authorizationService: AuthorizationService) {
    this.getToken();
  }

  public connect(): void {
    if (!this.isConnected) {
      if (this.token) {
        this.client = new Client({
          webSocketFactory: () =>
            new SockJS(`${this.apiUrl}/ws?_csrf=${this.token}`),
          reconnectDelay: 5000,
          connectHeaders: {
            'X-CSRF-TOKEN': this.token,
          },
        });
        this.client.onConnect = () => {
          this.isConnected = true;
          this.isWsConnectionReady.next(true);
          if (this.isConnected) {
            this.getProcessProgress();
          }
        };

        this.client.onStompError = frame => {
          console.error(`Broker reported error: ${frame.headers['message']}`);
          console.error(`Additional details: ${frame.body}`);
        };

        this.client.activate();
      } else {
        console.error('CSRF token not available');
      }
    }
  }

  public disconnect(): void {
    if (this.isConnected && this.client) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('Disconnected');
    }
  }

  public getProcessProgress() {
    if (!this.client || !this.client.connected) {
      console.error('STOMP client is not connected.');
      return this.updatedWorkflowInstances.asObservable();
    }

    try {
      this.client.subscribe('/topic/workflow-instances', response => {
        this.updatedWorkflowInstances.next(response);
      });
    } catch (error) {
      console.error('Error occurred during subscription:', error);
    }
    return this.updatedWorkflowInstances.asObservable();
  }

  public token: string = '';

  public async getToken(): Promise<void> {
    this.token = await this.authorizationService.getCsrfToken();
    this.connect();
  }
}
