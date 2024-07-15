import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/commons/pagination/pagination.component';
import { IPage } from 'src/app/interfaces/page.model';
import { ApiService } from 'src/app/services/api.service';
import { WebSocketAPI } from 'src/app/websocket/websocket.service';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss',
})
export class MonitorComponent implements OnInit, OnDestroy {
  private websocketSubscription!: Subscription;
  public instances: any[] = [];
  public pageParams = this.getDefaultPageParams();
  public runningInstancesCount: number = 0;

  headings: string[] = [
    'INSTANCE ID',
    'WORKFLOW',
    'IDENTIFIER',
    'STARTED ON',
    'ACTIONS',
  ];

  expandedId: number | undefined;

  constructor(
    private webSocketAPI: WebSocketAPI,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.updateInstances(this.pageParams);
  }
  public page!: IPage<any>;

  getDefaultPageParams() {
    return {
      page: 0,
      pageSize: 10,
      status: 'RUNNING',
    };
  }

  ngOnInit(): void {
    this.updateInstances(this.pageParams);
    this.updateDataFromWebSocket();
  }

  updateInstances(pageParams: any) {
    this.apiService
      .getInstancesByStatus(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.instances = data.content;
        this.runningInstancesCount = this.instances.length;
        this.cdRef.markForCheck();
      });
  }

  updateDataFromWebSocket() {
    this.webSocketAPI
      .getProcessProgress()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: any) => {
        this.updateInstances(this.pageParams);
      });
  }

  getRunningInstances(status: string) {
    this.pageParams.status = status;
    this.updateInstances(this.pageParams);
  }

  public expandAction(instance: any) {
    if (this.expandedId != instance.id) {
      this.expandedId = instance.id;
    } else {
      this.expandedId = undefined;
    }
  }

  public destroyed$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    // Unsubscribe from WebSocket when component is destroyed
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  updateParams(status: string) {
    this.pageParams.status = status;
    this.updateInstances(this.pageParams);
  }
}
