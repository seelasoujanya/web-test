import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketAPI } from 'src/app/websocket/websocket.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss',
})
export class MonitorComponent implements OnInit, OnDestroy {
  private websocketSubscription!: Subscription;

  constructor(private webSocketAPI: WebSocketAPI) {}

  ngOnInit(): void {
    this.webSocketAPI.isWsConnectionReady.subscribe(isReady => {
      if (isReady) {
        console.log('WebSocket connection is ready');
        const stompSubscription = this.webSocketAPI.subscribe(
          '/topic/messages',
          (messageOutput: any) => {}
        );

        this.websocketSubscription = stompSubscription as any;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket when component is destroyed
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }
}
