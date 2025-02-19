import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
} from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { IPage } from 'src/app/core/models/page.model';
import { Workflow } from 'src/app/core/models/workflow.model';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [
    WorkflowTableComponent,
    PaginationComponent,
    FormsModule,
    CommonModule,
    TooltipModule,
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
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [ApiService, BsModalService],
})
export class WorkflowsComponent implements OnDestroy, OnInit {
  workflowsData: Workflow[] = [];

  filteredWorkflows: Workflow[] = [];
  bookmarkedIds: number[] = [];

  workflowName: string = '';

  noWorkflows: boolean = false;

  appliedFilters: { key: string; label: string; value: unknown }[] = [];

  noBookmarkedWorkflows: boolean = false;

  BGroupId: string = '';

  showBookMarks: boolean = false;

  selectedFilter: string = 'created';

  headings: string[] = [
    'Workflow Name',
    'Status',
    'Last Run On',
    'Last Run Status',
    'Actions',
    'Pause',
  ];
  workflow: Workflow = {
    name: '',
    enabled: true,
    paused: false,
    created: '',
    modified: '',
    status: 'NOT_RUNNABLE',
    alias: '',
    id: 0,
    throttleLimit: 10,
    description: '',
  };

  currentStep: number = 0;
  steps = ['Choose Delivertype and Workflowtype ', 'Workflow Info'];

  headingEnum = {
    'Workflow Name': 'name',
    Status: 'status',
    Created: 'created',
    'Last Run On': 'created',
    'Last Run Status': 'status',
  };

  workflow_status = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Disabled', value: 'NOT_RUNNABLE' },
  ];

  filtersApplied: boolean = false;

  selectingStart = true;

  public destroyed$ = new Subject<void>();
  selectedDeliverType: string | null = null;
  selectedWorkflowType: string | null = null;

  deliveryTypes = [
    { label: 'Product', value: 'product' },
    { label: 'Fingerprint', value: 'fingerprint' },
    { label: 'Recording', value: 'recording' },
    { label: 'Data Retrieval', value: 'data_retrieval' },
    { label: 'Others', value: 'others' },
  ];

  workflowTypes: Record<string, { label: string; value: string }[]> = {
    product: [
      { label: 'DDEX', value: 'DDEX' },
      { label: 'Apple Music', value: 'APPLE_MUSIC' },
    ],
    fingerprint: [{ label: 'UGC', value: 'UGC_ERN_DDEX' }],
    recording: [],
    data_retrieval: [],
    others: [],
  };

  getAvailableWorkflows(): { label: string; value: string }[] {
    return null != this.selectedDeliverType
      ? this.workflowTypes[this.selectedDeliverType] || []
      : [];
  }
  activeTab: number = 1;
  workflowhasAlias: any;
  aliasError: string | undefined;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.initializeFilters();
    this.pageParams = this.getDefaultPageParams();
    this.bookmarkedPageParams = this.getDefaultPageParams();
    this.getUserId().then(() => {
      if (this.filter.bookmark) {
        this.showBookMarks = true;
        this.fetchBookmarkedWorkflows();
      } else {
        this.showBookMarks = false;
        this.getPageItems(this.pageParams);
      }
    });
  }

  initializeFilters(): void {
    const savedFilters = localStorage.getItem('workflowFilters');
    if (savedFilters) {
      this.filter = JSON.parse(savedFilters);
      this.getAppliedFilters();
    }
    this.filtersApplied = this.hasActiveFilters();
  }

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private authorizationService: AuthorizationService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {
    // this.getUserId();
  }

  filter = {
    bookmark: null as boolean | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: null as string[] | null,
  };

  selectFilter(filterName: string) {
    this.selectedFilter = filterName;
  }

  getSelectedFilterLabel(): string {
    switch (this.selectedFilter) {
      case 'bookmarks':
        return 'Bookmarks';
      default:
        return '';
    }
  }

  public resetFilters() {
    this.filter = {
      bookmark: null,
      startDate: null,
      endDate: null,
      status: null,
    };
    // Remove filters from localStorage
    localStorage.removeItem('workflowFilters');
  }

  applyFilters() {
    this.bsModalRef.hide();
    this.formatFilterDates();
    this.filtersApplied = this.hasActiveFilters();

    // Save filters to localStorage
    localStorage.setItem('workflowFilters', JSON.stringify(this.filter));

    if (this.filter.bookmark) {
      this.showBookMarks = true;
      this.bookmarkedPageParams = this.getDefaultPageParams();
      this.fetchBookmarkedWorkflows();
    } else {
      this.showBookMarks = false;
      this.pageParams = this.getDefaultPageParams();
      this.getPageItems(this.pageParams);
    }
    this.getAppliedFilters();
    this.cdRef.detectChanges();
  }

  formatFilterDates() {
    if (this.filter.startDate) {
      this.filter.startDate = this.formatDateForApi(this.filter.startDate);
    }
    if (this.filter.endDate) {
      this.filter.endDate = this.formatDateForApi(this.filter.endDate);
    }
  }

  formatDateForApi(date: Date | null): any {
    if (!date) return null;
    return formatDate(date, 'yyyy-MM-dd HH:mm:ss.SSS', 'en-US');
  }

  public closeModal(): void {
    this.bsModalRef.hide();
    if (!this.filtersApplied) {
      this.resetFilters();
    }

    // Reset filter values to defaults
    this.filter.bookmark = null;
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.filter.status = null;

    this.appliedFilters.forEach(appliedFilter => {
      switch (appliedFilter.key) {
        case 'bookmark':
          this.filter.bookmark = appliedFilter.value as boolean | null;
          break;
        case 'startDate':
          if (Array.isArray(appliedFilter.value)) {
            const dateRange = (appliedFilter.value[0] as string).split(' - ');
            this.filter.startDate = dateRange[0]
              ? new Date(dateRange[0])
              : null;
            this.filter.endDate = dateRange[1] ? new Date(dateRange[1]) : null;
          }
          break;
        case 'status':
          if (Array.isArray(appliedFilter.value)) {
            this.filter.status = appliedFilter.value as string[];
          }
          break;
      }
    });
  }

  filterDeliveries(filterWorkflowsTemplate: TemplateRef<any>) {
    this.openDialog(filterWorkflowsTemplate);
  }

  openCreateWorkflow(template: TemplateRef<any>) {
    // this.modalService.show(template);
    this.openDialog(template);
  }

  onDeliveryTypeChange() {
    this.selectedWorkflowType = null;
  }

  checkAlias() {
    if (this.workflow.alias) {
      this.apiService
        .getWorkflowByAlias(this.workflow.alias)
        .subscribe(data => {
          this.workflowhasAlias = data;
          if (this.workflowhasAlias != null) {
            this.aliasError =
              'The alias already exists. Please enter a different one';
          } else {
            this.aliasError = '';
          }
        });
    } else {
      this.aliasError = '';
    }
  }

  ggcreateWorkflow(): void {
    this.closeCreateWorkflowModal();
    this.apiService.createWorkflow(this.workflow).subscribe({
      next: response => {
        this.createStep({
          workflowId: response.id,
          executionOrder: 1,
          type: this.selectedWorkflowType,
          name: this.selectedWorkflowType,
        });
        this.selectedDeliverType = null;
        this.selectedWorkflowType = null;
        this.router.navigate(['/workflows', response.id], {
          queryParams: { tab: '' },
        });
      },
    });
  }

  public createStep(workflowStepDto: any): void {
    this.apiService.createStep(workflowStepDto).subscribe({
      next: response => {
        console.log('Step created with ID:', response.id);
      },
    });
  }

  public closeCreateWorkflowModal(): void {
    this.bsModalRef.hide();
    this.cdr.detectChanges();
  }
  openDialog(workflowsTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(workflowsTemplate, config);
    this.openDialogWithSelectedDateRange();
  }

  getPageItems(pageParams: any) {
    this.spinnerService.show();
    this.apiService
      .getWorkflows(pageParams, this.filter)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.workflowsPage = data;
        this.page = this.workflowsPage;
        this.workflowsData = data.content;
        this.filteredWorkflows = [...this.workflowsData];
        this.noWorkflows = this.filteredWorkflows.length === 0;
        this.spinnerService.hide();
        this.cdRef.markForCheck();
      });
  }

  public viewInstances(data: any): void {
    this.router.navigate(['/workflows', data.id], {
      state: { name: data.name },
    });
  }

  public reload(workflows: any) {
    this.getPageItems(this.pageParams);
  }

  public pauseWorkflow(workflow: Workflow) {
    const newStatus = workflow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const pause = workflow.paused;
    const newData = {
      name: null,
      description: null,
      status: newStatus,
      throttleLimit: null,
      paused: pause,
      isTaskChainIsValid: null,
    };
    this.apiService.updateWorkflow(workflow.id, newData).subscribe(result => {
      workflow.status = result.status;
      this.cdRef.markForCheck();
    });
  }

  onPage(pageNumber: number) {
    if (this.showBookMarks) {
      this.bookmarkedPageParams.page = pageNumber - 1;
      this.fetchBookmarkedWorkflows();
    } else {
      this.pageParams.page = pageNumber - 1;
      this.getPageItems(this.pageParams);
    }
  }
  public page!: IPage<any>;
  public workflowsPage!: IPage<any>;
  public bookmarksPage!: IPage<any>;
  public pageParams = this.getDefaultPageParams();
  public bookmarkedPageParams = this.getDefaultPageParams();

  getDefaultPageParams() {
    return {
      page: 0,
      pageSize: 20,
      sortBy: '',
      order: 'desc',
      search: '',
    };
  }

  sortColumn(event: any) {
    let heading = event.sortBy;
    const sortKey = this.headingEnum[heading as keyof typeof this.headingEnum];
    if (this.showBookMarks) {
      this.bookmarkedPageParams.sortBy = sortKey;
      this.bookmarkedPageParams.order = event.order;
      this.fetchBookmarkedWorkflows();
    } else {
      this.pageParams.sortBy = sortKey;
      this.pageParams.order = event.order;
      this.getPageItems(this.pageParams);
    }
  }

  searchWorkflow(): void {
    this.pageParams.page = 0;
    this.pageParams.search = this.workflowName;
    this.getPageItems(this.pageParams);
    this.cdRef.detectChanges();
  }
  clearInput(): void {
    this.workflowName = '';
    this.pageParams.search = '';
    this.getPageItems(this.pageParams);
    this.noWorkflows = this.filteredWorkflows.length === 0;
  }

  bookmarkWorkflow(workflow: Workflow, userName: String) {
    const newData = {
      workflowId: workflow.id,
      userName: userName,
    };
    this.apiService.bookmarkWorkflow(newData).subscribe(result => {
      this.bookmarkedIds.push(workflow.id);
      this.cdRef.markForCheck();
    });
  }

  removeBookmark(workflow: Workflow, userName: string) {
    this.apiService.removeBookmark(workflow.id, userName).subscribe(result => {
      const index = this.bookmarkedIds.indexOf(workflow.id);
      if (index != -1) {
        this.bookmarkedIds.splice(index, 1);
      }
      this.cdRef.markForCheck();
    });
  }

  async getUserId(): Promise<void> {
    this.BGroupId = await this.authorizationService.getBGroupId();
    this.apiService.getBookmarksByUsername(this.BGroupId).subscribe(result => {
      this.bookmarkedIds = result.map((bookmark: any) => bookmark.workflowId);
    });
  }

  toggleBookmark(workflow: Workflow) {
    if (this.bookmarkedIds.includes(workflow.id)) {
      this.removeBookmark(workflow, this.BGroupId);
    } else {
      this.bookmarkWorkflow(workflow, this.BGroupId);
    }
  }

  fetchBookmarkedWorkflows() {
    this.spinnerService.show();
    this.apiService
      .getBookmarkedWorkflowsByUsername(
        this.BGroupId,
        this.bookmarkedPageParams,
        this.filter
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        data => {
          this.bookmarksPage = data;
          this.page = this.bookmarksPage;
          this.filteredWorkflows = data.content;
          this.noBookmarkedWorkflows = this.filteredWorkflows.length === 0;
          this.spinnerService.hide();
          this.cdRef.markForCheck();
        },
        (error: any) => {
          this.spinnerService.hide();
        }
      );
  }

  hasActiveFilters(): boolean {
    return (
      this.filter.bookmark !== null ||
      this.filter.startDate !== null ||
      this.filter.endDate !== null ||
      this.filter.status !== null
    );
  }
  getAppliedFilters() {
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

    // Function to remove filter by key
    const removeFilterByKey = (key: string) => {
      this.appliedFilters = this.appliedFilters.filter(
        filter => filter.key !== key
      );
    };

    // Handle bookmark filter
    if (this.filter.bookmark === false || this.filter.bookmark === null) {
      removeFilterByKey('bookmark');
    } else if (this.filter.bookmark === true) {
      addOrUpdateFilter('bookmark', 'Bookmark', 'Yes');
    }

    // Handle status filter
    if (!this.filter.status || this.filter.status.length === 0) {
      removeFilterByKey('status');
    } else {
      addOrUpdateFilter('status', 'Status', this.filter.status);
    }

    // Handle startDate and endDate filter
    if (this.filter.startDate === null || this.filter.endDate === null) {
      removeFilterByKey('startDate');
      removeFilterByKey('endDate');
    } else {
      const dateRange =
        this.filter.startDate && this.filter.endDate
          ? `${formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US')} - ${formatDate(this.filter.endDate, 'yyyy-MM-dd', 'en-US')}`
          : formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US');
      addOrUpdateFilter('startDate', 'Created Date', [dateRange]);
    }
  }

  clearFilter(key: string): void {
    const filterIndex = this.appliedFilters.findIndex(
      filter => filter.key === key
    );
    if (filterIndex > -1) {
      this.appliedFilters.splice(filterIndex, 1);
    }

    if (key === 'bookmark' || key === 'status') {
      this.filter[key] = null;
    } else if (key === 'startDate') {
      this.filter.startDate = null;
      this.filter.endDate = null;
    }
    this.filtersApplied = this.hasActiveFilters();
    // Save updated filters to localStorage
    localStorage.setItem('workflowFilters', JSON.stringify(this.filter));
    if (this.filter.bookmark) {
      this.showBookMarks = true;
      this.bookmarkedPageParams = this.getDefaultPageParams();
      this.fetchBookmarkedWorkflows();
    } else {
      this.showBookMarks = false;
      this.noBookmarkedWorkflows = false;
      this.pageParams = this.getDefaultPageParams();
      this.getPageItems(this.pageParams);
    }
    this.getAppliedFilters();
    this.cdRef.detectChanges();
  }

  clearDates(): void {
    this.filter.startDate = null;
    this.filter.endDate = null;
    this.cdRef.detectChanges();
  }

  isFilterApplied(key: string): boolean {
    return this.appliedFilters.some(filter => filter.key === key);
  }

  openDialogWithSelectedDateRange() {
    if (this.filter.startDate && this.filter.endDate) {
      this.filter.startDate = new Date(this.filter.startDate);
      this.filter.endDate = new Date(this.filter.endDate);
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 0) this.currentStep--;
  }
  progressWidth() {
    return `${(this.currentStep / (this.steps.length - 1)) * 100}%`;
  }
}
