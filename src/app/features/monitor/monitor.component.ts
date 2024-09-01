import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { ApiService } from 'src/app/core/services/api.service';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PRIORITY } from 'src/app/core/utils/constants';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import {
  SystemPropertiesDTO,
  SystemProperty,
} from 'src/app/core/models/workflow.model';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss',
  providers: [BsModalService],
})
export class MonitorComponent implements OnInit, OnDestroy {
  private websocketSubscription!: Subscription;
  public instances: any[] = [];
  public queuedInstances: any[] = [];
  public pageParams = this.getDefaultPageParams();
  public runningInstancesCount: number = 0;
  public pendingInstancesCount: number = 0;
  priorityConstants = PRIORITY;
  priority: any;

  headings: string[] = [
    'INSTANCE ID',
    'WORKFLOW',
    'IDENTIFIER',
    'STARTED ON',
    'ACTIONS',
  ];

  expandedId: number | undefined;

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
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
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
    this.getPausedProperty('paused');
  }

  public get getBsModalRef(): BsModalRef {
    return this.bsModalRef;
  }

  public getWebSocketSubscription(): Subscription | undefined {
    return this.websocketSubscription;
  }

  getPausedProperty(key: string): void {
    this.apiService.getPausedProperty(key).subscribe(
      (data: SystemProperty) => {
        this.pausedProperty = data;
      },
      (error: any) => {
        console.error('Error fetching  property:', error);
      }
    );
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

  openChangePriorityDialog(priorityTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(priorityTemplate, config);
  }

  public editPriority(instance: any, priorityTemplate: TemplateRef<any>) {
    this.priority = instance.priority;
    this.openChangePriorityDialog(priorityTemplate);
  }

  deleteInstance(id: any) {
    const updateData = { status: 'TERMINATED' };
    this.apiService.updateWorkflowInstance(id, updateData).subscribe(
      updatedInstance => {
        this.updateInstances(this.pageParams);
      },
      error => {
        console.error('Error updating workflow instance', error);
      }
    );
  }

  terminateInstance(id: any) {
    const modalData = {
      title: 'Delete Instance',
      description: `Are you sure you want to terminate instance with Id :${id} ?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    this.openConfirmModal(modalData, id);
  }

  updatePriority() {
    this.bsModalRef.hide();
    const updateData = { priority: this.priority };

    if (this.expandedId !== undefined) {
      this.apiService
        .updateWorkflowInstance(this.expandedId, updateData)
        .subscribe({
          next: response => {
            this.updateInstances(this.pageParams);
          },
          error: err => {
            console.error('Error updating priority', err);
          },
        });
    }
    this.reset();
  }

  public closeModal(): void {
    this.bsModalRef.hide();
  }

  public cancelChangesForPriority() {
    this.closeModal();
    this.reset();
  }

  public reset() {
    this.priority = null;
  }

  openConfirmModal(modalData: any, id: any) {
    this.bsModalRef = this.modalService.show(ConfirmModalComponent);
    this.bsModalRef.content.title = modalData.title;
    this.bsModalRef.content.description = modalData.description;
    this.bsModalRef.content.applyButton = modalData.btn1Name;
    this.bsModalRef.content.cancelButton = modalData.btn2Name;
    this.bsModalRef.content.updateChanges.subscribe((result: any) => {
      if (result) {
        this.deleteInstance(id);
      }
    });
  }

  pauseInstances() {
    this.pauseAllInstances = !this.pauseAllInstances;
    this.propertyDTO.value = this.pauseAllInstances.toString();
    this.propertyDTO.key = this.pausedProperty?.key;
    this.propertyDTO.description = this.pausedProperty?.description;
    this.apiService
      .updateSystemProperty(this.pausedProperty?.id, this.propertyDTO)
      .subscribe();
  }
}
