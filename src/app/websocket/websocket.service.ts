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
  private client!: Client;
  private isConnected = false;
  public isWsConnectionReady = new BehaviorSubject<boolean>(false);
  private apiUrl = `${environment.BE_URL}`;

  constructor(private authorizationService: AuthorizationService) {
    this.connect();
  }

  public connect(): void {
    if (!this.isConnected) {
      this.authorizationService.getCsrfToken().subscribe(token => {
        if (token) {
          this.client = new Client({
            webSocketFactory: () =>
              new SockJS(`${this.apiUrl}/ws?_csrf=${token.token}`),
            reconnectDelay: 5000,
            connectHeaders: {
              'X-CSRF-TOKEN': token.token,
            },
          });
          this.client.onConnect = () => {
            this.isConnected = true;
            this.isWsConnectionReady.next(true);
          };

          this.client.onStompError = frame => {
            console.error(`Broker reported error: ${frame.headers['message']}`);
            console.error(`Additional details: ${frame.body}`);
          };

          this.client.activate();
        } else {
          console.error('CSRF token not available');
        }
      });
    }
  }

  public disconnect(): void {
    if (this.isConnected && this.client) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('Disconnected');
    }
  }

  public subscribe(
    destination: string,
    callback: (message: any) => void
  ): StompSubscription {
    return this.client.subscribe(destination, message => {
      callback(JSON.parse(message.body));
    });
  }

  public send(destination: string, body: any): void {
    if (this.isConnected && this.client) {
      this.client.publish({ destination, body: JSON.stringify(body) });
    } else {
      console.error('WebSocket is not connected');
    }
  }
}
