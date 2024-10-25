import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CommonTableComponent } from 'src/app/common-table/common-table.component';
import { IPage } from 'src/app/core/models/page.model';
import { SystemProperty } from 'src/app/core/models/workflow.model';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { PRIORITY } from 'src/app/core/utils/constants';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { TimeFormatService } from 'src/app/time-format.service';

@Component({
  selector: 'app-running',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule,
    CommonTableComponent,
  ],
  templateUrl: './running.component.html',
  styleUrl: './running.component.scss',
  providers: [BsModalService, DatePipe],
})
export class RunningComponent {
  public pageParams = this.getDefaultPageParams();
  page!: IPage<any>;
  expandedId: number | undefined;

  headings: string[] = ['INSTANCE ID', 'WORKFLOW', 'IDENTIFIER', 'STARTED ON'];

  public runningInstances: any[] = [];
  public noRunningInstances: boolean = false;
  priority: any;
  propertyDTO: any;
  priorityConstants = PRIORITY;
  isUTC = false;
  getDefaultPageParams() {
    return {
      page: 0,
      pageSize: 10,
      status: 'RUNNING',
    };
  }

  constructor(
    private apiService: ApiService,
    private spinnerService: SpinnerService,
    private timeFormatService: TimeFormatService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.pageParams.status = 'RUNNING';
    console.log('runnig ' + this.runningInstances);

    this.updateRunningInstances(this.pageParams);
    console.log('runnig ' + 'runningInstances');

    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  getTableValues() {
    return this.runningInstances.map(instance => [
      instance.id,
      instance.workflow.name,
      instance.identifier,
      `${this.datePipe.transform(instance.created, 'MMM dd, yyyy', this.isUTC ? 'UTC' : 'GMT+5:30')}<br/>` +
        `${this.datePipe.transform(instance.created, 'HH:mm:ss', this.isUTC ? 'UTC' : 'GMT+5:30')}`,
    ]);
  }

  updateRunningInstances(pageParams: any) {
    this.spinnerService.show();
    this.apiService.getInstancesByStatus(pageParams).subscribe(data => {
      this.page = data;
      this.runningInstances = data.content;
      // Check if there are no instances left on the current page
      if (this.page.content.length === 0) {
        // If on the first page, don't navigate back
        if (this.pageParams.page > 0) {
          this.pageParams.page--; // Move to the previous page
        }
        this.updateRunningInstances(this.pageParams); // Fetch new instances for the updated page
      }
      this.noRunningInstances = this.runningInstances.length === 0;
      this.spinnerService.hide();
      this.cdRef.markForCheck();
    });
  }

  public expandAction(instance: any) {
    if (this.expandedId != instance.id) {
      this.expandedId = instance.id;
    } else {
      this.expandedId = undefined;
    }
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
    console.log('Selected Instance ID:', instanceId);

    const selectedInstance = this.runningInstances.find(
      inst => inst.id === Number(instanceId)
    );

    if (selectedInstance) {
      console.log('Selected Instance:', selectedInstance);
      this.priority = selectedInstance.priority;
      this.openChangePriorityDialog(priorityTemplate);
    } else {
      console.error('Instance not found with ID:', instanceId);
    }
  }

  deleteInstance(id: any) {
    const updateData = { status: 'TERMINATED' };
    this.apiService.updateWorkflowInstance(id, updateData).subscribe(
      updatedInstance => {
        this.updateRunningInstances(this.pageParams);
      },
      error => {
        console.error('Error updating workflow instance', error);
      }
    );
  }

  onTerminateInstance(id: any) {
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
            this.updateRunningInstances(this.pageParams);
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

  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.updateRunningInstances(this.pageParams);
  }
}
