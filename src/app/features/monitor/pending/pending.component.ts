import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { CommonTableComponent } from 'src/app/shared/components/common-table/common-table.component';
import { IPage } from 'src/app/core/models/page.model';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { PRIORITY } from 'src/app/core/utils/constants';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { TimeFormatService } from 'src/app/time-format.service';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [
    NgSelectModule,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule,
    CommonTableComponent,
    CommonModule,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
  providers: [BsModalService, DatePipe],
})
export class PendingComponent {
  headings: string[] = ['INSTANCE ID', 'WORKFLOW', 'IDENTIFIER', 'STARTED ON'];

  public pageParams = this.getDefaultPageParams();
  page!: IPage<any>;
  getDefaultPageParams() {
    return { page: 0, pageSize: 10, status: 'PENDING' };
  }

  public pendingInstances: any[] = [];
  public noPendingInstances = false;
  isUTC = false;
  expandedId: number | undefined;
  priority: any;
  priorityConstants = PRIORITY;
  public tableValues: any[] = [];
  private bsModalRef!: BsModalRef;
  websocketSubscription!: Subscription;
  public destroyed$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private spinnerService: SpinnerService,
    private timeFormatService: TimeFormatService,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private webSocketAPI: WebSocketAPI
  ) {}

  ngOnInit(): void {
    this.updatePendingInstances(this.pageParams);
    this.updateDataFromWebSocket();

    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  formatDate(date: string | Date) {
    return this.timeFormatService.formatDate(date);
  }
  updateDataFromWebSocket() {
    this.websocketSubscription =
      this.webSocketAPI.totalWorkflowsStatusCounts.subscribe(data => {
        if (data) {
          this.pendingInstances = data.pendingInstances.content;
          this.noPendingInstances = this.pendingInstances.length === 0;
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  getTableValues() {
    return this.pendingInstances.map(instance => {
      return [
        instance.id,
        instance.workflowName,
        instance.identifier,
        `${this.formatDate(instance.created).date}<br />` +
          `<span class="time">${this.formatDate(instance.created).time} </span>`,
      ];
    });
  }

  updatePendingInstances(pageParams: any) {
    this.spinnerService.show();
    this.apiService.getInstancesByStatus(pageParams).subscribe(data => {
      this.page = data;
      this.pendingInstances = data.content;
      if (this.page.content.length === 0 && this.pageParams.page > 0) {
        this.pageParams.page--;
        this.updatePendingInstances(this.pageParams);
      }
      this.noPendingInstances = this.pendingInstances.length === 0;
      this.spinnerService.hide();
    });
  }

  expandAction(instance: any) {
    this.expandedId = this.expandedId !== instance.id ? instance.id : undefined;
  }

  openChangePriorityDialog(priorityTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(priorityTemplate, config);
  }

  onEditPriority(instance: any, priorityTemplate: TemplateRef<any>) {
    const instanceId = instance[0];
    this.expandedId = Number(instanceId);
    const selectedInstance = this.pendingInstances.find(
      inst => inst.id === Number(instanceId)
    );

    if (selectedInstance) {
      this.priority = selectedInstance.priority;
      this.openChangePriorityDialog(priorityTemplate);
    }
  }

  updatePriority() {
    this.bsModalRef.hide();
    const updateData = { priority: this.priority };
    if (this.expandedId !== undefined) {
      this.apiService
        .updateWorkflowInstance(this.expandedId, updateData)
        .subscribe({
          next: () => {
            this.updatePendingInstances(this.pageParams);
            this.cdRef.detectChanges();
          },
        });
    }
    this.reset();
  }

  reset() {
    this.priority = null;
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  cancelChangesForPriority() {
    this.closeModal();
    this.reset();
  }

  onTerminateInstance(id: any) {
    const modalData = {
      title: 'Delete Instance',
      description: `Are you sure you want to terminate instance with Id: ${id}?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    this.openConfirmModal(modalData, id);
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

  deleteInstance(id: any) {
    const updateData = { status: 'TERMINATED' };
    this.apiService
      .updateWorkflowInstance(id, updateData)
      .subscribe(() => this.updatePendingInstances(this.pageParams));
  }

  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.updatePendingInstances(this.pageParams);
  }
}
