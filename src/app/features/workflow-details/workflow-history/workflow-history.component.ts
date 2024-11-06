import { CommonModule, formatDate } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { IPage } from 'src/app/core/models/page.model';
import { WorkflowInstance } from 'src/app/core/models/workflowinstance.model';
import { DurationPipe } from 'src/app/shared/pipes/duration.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import {
  DELIVERY_TYPE,
  PRIORITY,
  WORKFLOW_INSTANCE_STATUS,
} from 'src/app/core/utils/constants';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-workflow-history',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowTableComponent,
    DurationPipe,
    PaginationComponent,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSliderModule,
    NgSelectModule,
  ],
  templateUrl: './workflow-history.component.html',
  styleUrl: './workflow-history.component.scss',
  providers: [ApiService, BsModalService],
})
export class WorkflowHistoryComponent implements OnDestroy, OnInit {
  private destroyed$ = new Subject<void>();
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.getPageItems(this.pageParams);
  }
  workflowsInstances: WorkflowInstance[] = [];
  identifier: string = '';
  noInstancesFound: boolean = false;

  instanceHeadings: string[] = [
    'Identifier',
    'Created',
    'Completed',
    'Duration',
    'Delivery Type',
    'Status',
    'Priority',
  ];

  headingEnum = {
    'Queued On': 'created',
    'Started On': 'created',
    Duration: 'duration',
    'Delivery Type': 'status',
    Status: 'status',
    Priority: 'priority',
  };

  public workflowId: string | null;

  public workflowName: string | undefined;

  deliveredInstancesCount = 0;
  totalInstancesCount = 0;
  failedInstancesCount = 0;

  filter = {
    startDate: null,
    completedDate: null,
    deliveryType: [] as string[],
    status: [] as string[],
    priority: [] as string[],
    duration: 0,
    identifier: [] as string[],
  };

  workflowInstanceStatus = WORKFLOW_INSTANCE_STATUS;

  priority = PRIORITY;

  deliveryType = DELIVERY_TYPE;

  showFilters: boolean = false;

  selectedFilter: string = 'startDate';

  filtersApplied: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ) {
    this.workflowId = this.route.snapshot.params['id'];
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { name: string };
    if (state) {
      this.workflowName = state.name;
    }
  }

  selectFilter(filterName: string) {
    this.selectedFilter = filterName;
  }

  getSelectedFilterLabel(): string {
    switch (this.selectedFilter) {
      case 'startDate':
        return 'Start Date';
      case 'completedDate':
        return 'Completed Date';
      case 'duration':
        return 'Duration';
      case 'status':
        return 'Status';
      case 'priority':
        return 'Priority';
      case 'deliveryType':
        return 'Delivery Type';
      case 'identifier':
        return 'Identifier';
      default:
        return '';
    }
  }

  hasActiveFilters(): boolean {
    return (
      this.filter.startDate !== null ||
      this.filter.completedDate !== null ||
      this.filter.deliveryType.length > 0 ||
      this.filter.status.length > 0 ||
      this.filter.priority.length > 0 ||
      this.filter.duration > 0 ||
      this.filter.identifier.length > 0
    );
  }

  getAppliedFilters(): { key: string; label: string; value: string[] }[] {
    const appliedFilters = [];
    if (this.filter.startDate) {
      appliedFilters.push({
        key: 'startDate',
        label: 'Start Date',
        value: [formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US')],
      });
    }
    if (this.filter.completedDate) {
      appliedFilters.push({
        key: 'completedDate',
        label: 'Completed Date',
        value: [formatDate(this.filter.completedDate, 'yyyy-MM-dd', 'en-US')],
      });
    }
    if (this.filter.duration > 0) {
      appliedFilters.push({
        key: 'duration',
        label: 'Duration',
        value: [`${this.filter.duration} min`],
      });
    }
    if (this.filter.status && this.filter.status.length > 0) {
      appliedFilters.push({
        key: 'status',
        label: 'Status',
        value: this.filter.status,
      });
    }
    if (this.filter.priority && this.filter.priority.length > 0) {
      appliedFilters.push({
        key: 'priority',
        label: 'Priority',
        value: this.filter.priority,
      });
    }
    if (this.filter.deliveryType && this.filter.deliveryType.length > 0) {
      appliedFilters.push({
        key: 'deliveryType',
        label: 'Delivery Type',
        value: this.filter.deliveryType,
      });
    }
    if (this.filter.identifier && this.filter.identifier.length > 0) {
      appliedFilters.push({
        key: 'identifier',
        label: 'Identifier',
        value: this.filter.identifier,
      });
    }
    return appliedFilters;
  }

  clearFilter(key: string): void {
    if (key === 'startDate' || key === 'completedDate') {
      this.filter[key] = null;
    } else if (
      key === 'priority' ||
      key === 'deliveryType' ||
      key === 'status' ||
      key === 'identifier'
    ) {
      this.filter[key].shift();
    } else if (key === 'duration') {
      this.filter[key] = 0;
    }
    this.filtersApplied = this.hasActiveFilters();
    this.getPageItems(this.pageParams);
  }

  identifiers: string[] = [];

  identifierInput: string = '';

  addIdentifier() {
    if (this.identifierInput) {
      const trimmedIdentifiers = this.identifierInput
        .split(',')
        .map(id => id.trim())
        .filter(id => id);
      trimmedIdentifiers.forEach(id => {
        if (!this.filter.identifier.includes(id)) {
          this.filter.identifier.push(id);
        }
      });
      this.identifierInput = '';
    }
  }

  clearAllIdentifiers() {
    this.filter.identifier = [];
    this.identifierInput = '';
  }

  removeIdentifier(index: number): void {
    this.filter.identifier.splice(index, 1);
  }

  getPageItems(pageParams: any) {
    this.spinnerService.show();
    this.apiService
      .getWorkflowInstances(pageParams, this.workflowId, this.filter)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.reset();
        this.workflowsInstances = data.content;
        this.updateWorkflowsData();
        this.spinnerService.hide();
        this.cdRef.markForCheck();
        this.noInstancesFound = false;
      });
  }

  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.getPageItems(this.pageParams);
  }

  public page!: IPage<any>;
  private pageParams = this.getDefaultPageParams();

  getDefaultPageParams() {
    return {
      page: 0,
      pazeSize: 20,
      sortBy: 'id',
      order: 'asc',
    };
  }

  public backToWorkflows(): void {
    this.router.navigate(['/workflows']);
  }

  sortColumn(event: any) {
    let heading = event.sortBy;
    this.pageParams.sortBy =
      this.headingEnum[heading as keyof typeof this.headingEnum];
    this.pageParams.order = event.order;
    this.getPageItems(this.pageParams);
  }

  updateWorkflowsData(): void {
    this.workflowsInstances.forEach(workflow => {
      if (
        workflow.status &&
        (workflow.status === 'FAILED' || workflow.status === 'CANCELLED')
      ) {
        this.failedInstancesCount++;
      } else if (
        workflow.status &&
        (workflow.status === 'CREATED' ||
          workflow.status === 'RUNNING' ||
          workflow.status === 'COMPLETED')
      ) {
        this.deliveredInstancesCount++;
      }
    });
    this.totalInstancesCount += this.workflowsInstances.length;
  }

  public reset() {
    this.failedInstancesCount = 0;
    this.deliveredInstancesCount = 0;
    this.totalInstancesCount = 0;
  }

  searchWorkflowInstance(): void {
    if (this.identifier) {
      const id = this.identifier;
      this.apiService
        .getWorkflowInstances(
          this.pageParams,
          this.workflowId,
          this.identifier.toLowerCase()
        )
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: data => {
            this.page = data;
            this.reset();
            this.workflowsInstances = data.content;
            this.updateWorkflowsData();
            this.cdRef.markForCheck();
            this.noInstancesFound = this.workflowsInstances.length === 0;
          },
          error: () => {
            this.workflowsInstances = [];
            this.noInstancesFound = true;
            this.cdRef.markForCheck();
          },
        });
    } else {
      this.getPageItems(this.pageParams);
    }
  }

  public viewInstanceDetails(data: any): void {
    this.router.navigate([
      `/workflows/${this.workflowId}/workflowinstance`,
      data.id,
    ]);
  }

  updateDurationValue() {
    console.log(this.filter.duration);
  }

  public resetFilters() {
    this.filter = {
      startDate: null,
      completedDate: null,
      deliveryType: [],
      status: [],
      priority: [],
      duration: 0,
      identifier: [],
    };
  }

  completedDateFilter = (date: null): boolean => {
    if (!this.filter.startDate) {
      return true;
    }
    return date ? date >= this.filter.startDate : false;
  };

  startDateFilter = (date: null): boolean => {
    if (this.filter.completedDate) {
      return !date || date <= this.filter.completedDate;
    }
    return true;
  };

  openDialog(emailTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(emailTemplate, config);
  }
  public closeModal(): void {
    this.bsModalRef.hide();
    if (!this.filtersApplied) {
      this.resetFilters();
    }
  }
  filterDeliveries(filterDeliveriesTemplate: TemplateRef<any>) {
    this.openDialog(filterDeliveriesTemplate);
  }
  applyFilters() {
    this.bsModalRef.hide();
    this.formatFilterDates();
    this.filtersApplied = this.hasActiveFilters();
    this.getPageItems(this.pageParams);
  }
  formatFilterDates() {
    if (this.filter.startDate) {
      this.filter.startDate = this.formatDateForApi(this.filter.startDate);
    }
    if (this.filter.completedDate) {
      this.filter.completedDate = this.formatDateForApi(
        this.filter.completedDate
      );
    }
  }

  formatDateForApi(date: Date | null): any {
    if (!date) return null;
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss.SSS', 'en-US');
  }
}
