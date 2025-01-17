import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
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
    private bsModalRef: BsModalRef
  ) {
    // this.getUserId();
  }

  filter = {
    bookmark: null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: null,
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
  }

  filterDeliveries(filterWorkflowsTemplate: TemplateRef<any>) {
    this.openDialog(filterWorkflowsTemplate);
  }

  openDialog(workflowsTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(workflowsTemplate, config);
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
    const newStatus = !workflow.enabled;
    const pause = workflow.paused;
    const newData = {
      name: null,
      description: null,
      enabled: newStatus,
      throttleLimit: null,
      paused: pause,
      isTaskChainIsValid: null,
    };
    this.apiService.updateWorkflow(workflow.id, newData).subscribe(result => {
      workflow.enabled = result.enabled;
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
          console.error('Error fetching bookmarked workflows', error);
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

  getAppliedFilters(): { key: string; label: string; value: string }[] {
    const appliedFilters = [];

    if (this.filter.bookmark) {
      appliedFilters.push({
        key: 'bookmark',
        label: 'Bookmarks',
        value: 'Yes',
      });
    }

    if (this.filter.status) {
      appliedFilters.push({
        key: 'status',
        label: 'Status',
        value: this.filter.status,
      });
    }

    if (this.filter.startDate && this.filter.endDate) {
      appliedFilters.push({
        key: 'created',
        label: 'Created Date',
        value: `${formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US')} - ${formatDate(this.filter.endDate, 'yyyy-MM-dd', 'en-US')}`,
      });
    } else if (this.filter.startDate) {
      appliedFilters.push({
        key: 'created',
        label: 'Created Date',
        value: formatDate(this.filter.startDate, 'yyyy-MM-dd', 'en-US'),
      });
    }

    return appliedFilters;
  }

  clearFilter(key: string): void {
    if (key === 'bookmark' || key === 'status') {
      this.filter[key] = null;
    } else if (key === 'created') {
      (this.filter.startDate = null), (this.filter.endDate = null);
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
  }

  clearDates(): void {
    this.filter.startDate = null;
    this.filter.endDate = null;
  }
}
