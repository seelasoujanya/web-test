import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { ApiService } from 'src/app/core/services/api.service';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';

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
  public pendingInstancesCount: number = 0;

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
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService
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
    this.spinnerService.show();
    this.apiService
      .getInstancesByStatus(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.instances = data.content;
        if (pageParams.status == 'RUNNING') {
          this.runningInstancesCount = data.totalElements;
        } else {
          this.pendingInstancesCount = data.totalElements;
        }
        this.spinnerService.hide();
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

  terminateInstance(id: any) {
    this.apiService.updateWorkflowInstanceStatus(id, 'TERMINATED').subscribe(
      updatedInstance => {
        console.log('Workflow Instance updated:', updatedInstance);
      },
      error => {
        console.error('Error updating workflow instance', error);
      }
    );
  }
}
