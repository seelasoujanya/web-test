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
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
    TooltipModule,
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
    this.initializeFilters();
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
    'Delivery Type': 'deliveryType',
    Status: 'status',
    Priority: 'priority',
    Created: 'created',
    Completed: 'completed',
  };

  public workflowId: string | null;
  appliedFilters: { key: string; label: string; value: unknown }[] = [];

  public workflowName: string | undefined;

  deliveredInstancesCount = 0;
  totalInstancesCount = 0;
  failedInstancesCount = 0;

  filter = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    start: null as Date | null,
    completedDate: null as Date | null,
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

  initializeFilters(): void {
    const savedFilters = localStorage.getItem('workflowInstanceFilters');
    if (savedFilters) {
      this.filter = JSON.parse(savedFilters);
      this.getAppliedFilters();
    }
    this.filtersApplied = this.hasActiveFilters();
  }

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
        return 'Created Date';
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
      this.filter.endDate !== null ||
      this.filter.start !== null ||
      this.filter.completedDate !== null ||
      this.filter.deliveryType.length > 0 ||
      this.filter.status.length > 0 ||
      this.filter.priority.length > 0 ||
      this.filter.duration > 0 ||
      this.filter.identifier.length > 0
    );
  }

  getAppliedFilters() {
    const priorityMapping: Record<string, string> = {
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    };

    const statusMapping: Record<string, string> = {
      COMPLETED: 'Success',
      FAILED: 'Error',
      CREATED: 'Created',
      QUEUED: 'Queued',
      RUNNING: 'Running',
      TERMINATED: 'Terminated',
    };

    const deliveryTypeMapping: Record<string, string> = {
      FULL_DELIVERY: 'Full Delivery',
      DATA_ONLY: 'Data Only',
      PACKSHOT: 'Packshot',
      SCREENGRAB: 'Screengrab',
      COVER_ART: 'Cover Art',
      INSERT: 'Insert',
    };

    const addOrUpdateFilter = (key: string, label: string, value: any) => {
      const existingFilterIndex = this.appliedFilters.findIndex(
        filter => filter.key === key
      );
      if (existingFilterIndex > -1) {
        this.appliedFilters[existingFilterIndex].value = value;
      } else {
        this.appliedFilters.push({ key, label, value });
      }
    };

    const removeFilterByKey = (key: string) => {
      this.appliedFilters = this.appliedFilters.filter(
        filter => filter.key !== key
      );
    };

    // Handle startDate and endDate filter
    if (this.filter.startDate && this.filter.endDate) {
      addOrUpdateFilter('startDate', 'Created Date', [
        `${formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US')} - ${formatDate(this.filter.endDate, 'yyyy-MM-dd', 'en-US')}`,
      ]);
    } else if (this.filter.startDate) {
      addOrUpdateFilter('startDate', 'Created Date', [
        formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US'),
      ]);
    } else {
      removeFilterByKey('startDate');
      removeFilterByKey('endDate');
    }

    // Handle completedDate filter
    if (this.filter.start && this.filter.completedDate) {
      addOrUpdateFilter('completedDate', 'Completed Date', [
        `${formatDate(this.filter.start, 'yyyy-MM-dd', 'en-US')} - ${formatDate(this.filter.completedDate, 'yyyy-MM-dd', 'en-US')}`,
      ]);
    } else if (this.filter.start) {
      addOrUpdateFilter('completedDate', 'Completed Date', [
        formatDate(this.filter.start, 'yyyy-MM-dd', 'en-US'),
      ]);
    } else {
      removeFilterByKey('completedDate');
    }

    // Handle duration filter
    if (this.filter.duration > 0) {
      addOrUpdateFilter('duration', 'Duration', [
        `${this.filter.duration} min`,
      ]);
    } else {
      removeFilterByKey('duration');
    }

    // Handle status filter
    if (this.filter.status && this.filter.status.length > 0) {
      const formattedStatus = this.filter.status.map(
        status => statusMapping[status as keyof typeof statusMapping] || status
      );
      addOrUpdateFilter('status', 'Status', formattedStatus);
    } else {
      removeFilterByKey('status');
    }

    // Handle priority filter
    if (this.filter.priority && this.filter.priority.length > 0) {
      const formattedPriority = this.filter.priority.map(
        priority =>
          priorityMapping[priority as keyof typeof priorityMapping] || priority
      );
      addOrUpdateFilter('priority', 'Priority', formattedPriority);
    } else {
      removeFilterByKey('priority');
    }

    // Handle deliveryType filter
    if (this.filter.deliveryType && this.filter.deliveryType.length > 0) {
      const formattedDeliveryType = this.filter.deliveryType.map(
        deliveryType =>
          deliveryTypeMapping[
            deliveryType as keyof typeof deliveryTypeMapping
          ] || deliveryType
      );
      addOrUpdateFilter('deliveryType', 'Delivery Type', formattedDeliveryType);
    } else {
      removeFilterByKey('deliveryType');
    }

    // Handle identifier filter
    if (this.filter.identifier && this.filter.identifier.length > 0) {
      addOrUpdateFilter('identifier', 'Identifier', this.filter.identifier);
    } else {
      removeFilterByKey('identifier');
    }

    this.cdRef.detectChanges();
  }

  clearFilter(key: string): void {
    const filterIndex = this.appliedFilters.findIndex(
      filter => filter.key === key
    );
    if (filterIndex > -1) {
      this.appliedFilters.splice(filterIndex, 1);
    }

    if (key === 'completedDate') {
      this.filter.start = null;
      this.filter.completedDate = null;
    } else if (key === 'startDate') {
      this.filter.startDate = null;
      this.filter.endDate = null;
    } else if (
      key === 'priority' ||
      key === 'deliveryType' ||
      key === 'status' ||
      key === 'identifier'
    ) {
      this.filter[key] = [];
    } else if (key === 'duration') {
      this.filter[key] = 0;
    }

    this.filtersApplied = this.hasActiveFilters();

    localStorage.setItem(
      'workflowInstanceFilters',
      JSON.stringify(this.filter)
    );

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

      const newIdentifiers = [...this.filter.identifier, ...trimmedIdentifiers];
      this.filter.identifier = [...new Set(newIdentifiers)]; // Optional: To ensure no duplicates

      this.identifierInput = '';

      this.filtersApplied = this.hasActiveFilters();
      localStorage.setItem(
        'workflowInstanceFilters',
        JSON.stringify(this.filter)
      );
    }
  }

  clearAllIdentifiers() {
    this.filter.identifier = [];
    this.identifierInput = '';
  }

  removeIdentifier(index: number): void {
    const removedIdentifier = this.filter.identifier.splice(index, 1)[0];
    const filterIndex = this.appliedFilters.findIndex(
      filter => filter.key === 'identifier'
    );
    if (filterIndex > -1) {
      const updatedIdentifiers = (
        this.appliedFilters[filterIndex].value as string[]
      ).filter((id: string) => id !== removedIdentifier);

      this.appliedFilters[filterIndex].value = updatedIdentifiers;
      if (updatedIdentifiers.length === 0) {
        this.appliedFilters.splice(filterIndex, 1);
      }
    }
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

  public resetFilters() {
    this.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      deliveryType: [],
      status: [],
      priority: [],
      duration: 0,
      identifier: [],
    };
    // Remove filters from localStorage
    localStorage.removeItem('workflowInstanceFilters');
  }

  openDialog(emailTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(emailTemplate, config);
    this.openDialogWithSelectedStartDateRange();
    this.openDialogWithSelectedCompletedDateRange();
  }

  public closeModal(): void {
    this.bsModalRef.hide();
    if (!this.filtersApplied) {
      this.resetFilters();
    }

    // Reset filter values to defaults
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.filter.start = null;
    this.filter.completedDate = null;
    this.filter.deliveryType = [];
    this.filter.status = [];
    this.filter.priority = [];
    this.filter.duration = 0;
    this.filter.identifier = [];

    this.appliedFilters.forEach(appliedFilter => {
      switch (appliedFilter.key) {
        case 'startDate':
          if (Array.isArray(appliedFilter.value)) {
            const dateRange = (appliedFilter.value[0] as string).split(' - ');
            this.filter.startDate = dateRange[0]
              ? new Date(dateRange[0])
              : null;
            this.filter.endDate = dateRange[1] ? new Date(dateRange[1]) : null;
          }
          break;
        case 'completedDate':
          if (Array.isArray(appliedFilter.value)) {
            const completedDateRange = (appliedFilter.value[0] as string).split(
              ' - '
            );
            this.filter.start = completedDateRange[0]
              ? new Date(completedDateRange[0])
              : null;
            this.filter.completedDate = completedDateRange[1]
              ? new Date(completedDateRange[1])
              : null;
          }
          break;
        case 'deliveryType':
          if (Array.isArray(appliedFilter.value)) {
            this.filter.deliveryType = appliedFilter.value as string[];
          }
          break;
        case 'status':
          if (Array.isArray(appliedFilter.value)) {
            this.filter.status = appliedFilter.value as string[];
          }
          break;
        case 'priority':
          if (Array.isArray(appliedFilter.value)) {
            this.filter.priority = appliedFilter.value as string[];
          }
          break;
        case 'duration':
          if (
            Array.isArray(appliedFilter.value) &&
            typeof appliedFilter.value[0] === 'string'
          ) {
            this.filter.duration = Number(
              (appliedFilter.value[0] as string).replace(' min', '')
            );
          }
          break;
        case 'identifier':
          if (Array.isArray(appliedFilter.value)) {
            this.filter.identifier = appliedFilter.value as string[];
          }
          break;
      }
    });
  }

  filterDeliveries(filterDeliveriesTemplate: TemplateRef<any>) {
    this.openDialog(filterDeliveriesTemplate);
  }

  applyFilters() {
    this.bsModalRef.hide();
    this.formatFilterDates();
    this.filtersApplied = this.hasActiveFilters();
    this.pageParams.page = 0;
    localStorage.setItem(
      'workflowInstanceFilters',
      JSON.stringify(this.filter)
    );
    this.getPageItems(this.pageParams);
    this.getAppliedFilters();
  }

  formatFilterDates() {
    if (this.filter.startDate) {
      this.filter.startDate = this.formatDateForApi(this.filter.startDate);
    }
    if (this.filter.endDate) {
      this.filter.endDate = this.formatDateForApi(this.filter.endDate);
    }
    if (this.filter.start) {
      this.filter.start = this.formatDateForApi(this.filter.start);
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

  clearDates(): void {
    this.filter.startDate = null;
    this.filter.endDate = null;
  }

  clearCompletedDatesRange(): void {
    this.filter.start = null;
    this.filter.completedDate = null;
  }

  isFilterApplied(key: string): boolean {
    return this.appliedFilters.some(filter => filter.key === key);
  }

  openDialogWithSelectedStartDateRange() {
    if (this.filter.startDate && this.filter.endDate) {
      this.filter.startDate = new Date(this.filter.startDate);
      this.filter.endDate = new Date(this.filter.endDate);
    }
  }

  openDialogWithSelectedCompletedDateRange() {
    if (this.filter.start && this.filter.completedDate) {
      this.filter.start = new Date(this.filter.start);
      this.filter.completedDate = new Date(this.filter.completedDate);
    }
  }
}
