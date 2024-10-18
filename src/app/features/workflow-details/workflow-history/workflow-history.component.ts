import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
  providers: [ApiService],
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
    deliveryType: null,
    status: null,
    priority: null,
    duration: 0,
  };

  workflowInstanceStatus = WORKFLOW_INSTANCE_STATUS;

  prority = PRIORITY;

  deliveryType = DELIVERY_TYPE;

  showFilters: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService
  ) {
    this.workflowId = this.route.snapshot.params['id'];
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { name: string };
    if (state) {
      this.workflowName = state.name;
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
      pazeSize: 10,
      sortBy: '',
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
    this.router.navigate(['/workflowinstance', data.id]);
  }

  updateDurationValue() {
    console.log(this.filter.duration);
  }

  public resetFilters() {
    this.filter = {
      startDate: null,
      completedDate: null,
      deliveryType: null,
      status: null,
      priority: null,
      duration: 0,
    };
  }

  filterDeliveries() {
    this.resetFilters();
    this.showFilters = true;
  }

  public cancelFilters() {
    this.showFilters = false;
    this.resetFilters();
    this.getPageItems(this.pageParams);
  }

  applyFilters() {
    this.formatFilterDates();
    this.getPageItems(this.pageParams);
    this.showFilters = false;
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
