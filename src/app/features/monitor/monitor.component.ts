import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { ApiService } from 'src/app/core/services/api.service';
import { TimeFormatService } from 'src/app/time-format.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { PendingComponent } from './pending/pending.component';
import { RunningComponent } from './running/running.component';
import { ProcessingByWorkflowComponent } from './processing-by-workflow/processing-by-workflow.component';
import {
  SystemPropertiesDTO,
  SystemProperty,
} from 'src/app/core/models/workflow.model';
import { PausedPropertyService } from 'src/app/paused-property.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    NgSelectModule,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule,
    PendingComponent,
    RunningComponent,
    ProcessingByWorkflowComponent,
  ],
  styleUrls: ['./monitor.component.scss'],
  providers: [BsModalService],
})
export class MonitorComponent implements OnInit, OnDestroy {
  public pageParams = this.getDefaultPageParams();
  public page!: IPage<any>;
  public activeTab: any = 'RUNNING';
  isUTC: boolean | undefined;
  public destroyed$ = new Subject<void>();
  isChecked: boolean | undefined;
  pausedSubscription!: Subscription;

  runningInstancesCount: number = 0;
  pendingInstancesCount: number = 0;
  websocketSubscription!: Subscription;
  pausedProperty: SystemProperty | undefined;

  pauseAllInstances: boolean = false;

  propertyDTO: SystemPropertiesDTO = {
    key: '',
    value: '',
    description: '',
  };

  constructor(
    private webSocketAPI: WebSocketAPI,
    private apiService: ApiService,
    private timeFormatService: TimeFormatService,
    private pausedPropertyService: PausedPropertyService
  ) {}

  getDefaultPageParams() {
    return {
      page: 0,
      pageSize: 10,
      status: 'RUNNING',
    };
  }

  ngOnInit(): void {
    this.getPausedProperty('paused');
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });

    this.apiService.retrieveTotalWorkflowsStatusCount().subscribe(data => {
      this.runningInstancesCount = data.runningCount;
      this.pendingInstancesCount = data.pendingCount;
    });

    // Subscribe to WebSocket updates for live count
    this.websocketSubscription =
      this.webSocketAPI.totalWorkflowsStatusCounts.subscribe(data => {
        console.log('Websocket status in Monitor Component');
        if (data) {
          this.runningInstancesCount = data.runningCount;
          this.pendingInstancesCount = data.pendingCount;
        }
      });
  }

  switchTab(tab: any) {
    this.activeTab = tab;
    this.pageParams.status = tab;
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    if (this.pausedSubscription) {
      this.pausedSubscription.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  getPausedProperty(key: string): void {
    this.apiService.getPausedProperty(key).subscribe((data: SystemProperty) => {
      this.pausedProperty = data;
      this.isChecked = data.value === 'true' ? true : false;
      this.pausedPropertyService.setPausedProperty(data);
    });
  }
  pauseInstances() {
    this.isChecked = !this.isChecked;
    this.propertyDTO.value = this.isChecked.toString();
    this.propertyDTO.key = 'paused';
    this.propertyDTO.description = this.pausedProperty?.description;
    this.apiService.updateSystemProperty(this.propertyDTO).subscribe(
      (data: SystemProperty) => {
        this.pausedProperty = data;
        this.isChecked = data.value === 'true' ? true : false;
        this.pausedPropertyService.setPausedProperty(data);
      },
      error => {
        console.error('Error updating system property:', error);
      }
    );
  }
}
