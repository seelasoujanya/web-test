import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/commons/pagination/pagination.component';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { IPage } from 'src/app/interfaces/page.model';
import { WorkflowInstance } from 'src/app/interfaces/workflowinstance.model';
import { DurationPipe } from 'src/app/pipes/duration.pipe';
import { ApiService } from 'src/app/services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workflow-details',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowTableComponent,
    DurationPipe,
    PaginationComponent,
    FormsModule,
  ],
  templateUrl: './workflow-details.component.html',
  styleUrl: './workflow-details.component.scss',
  providers: [ApiService],
})
export class WorkflowDetailsComponent implements OnDestroy, OnInit {
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
    'Queued On',
    'Started On',
    'Duration',
    'Delivery Type',
    'Status',
    'Priority',
    'Actions',
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

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.workflowId = this.route.snapshot.params['id'];
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { name: string };
    if (state) {
      this.workflowName = state.name;
    }
  }

  getPageItems(pageParams: any) {
    this.apiService
      .getWorkflowInstances(pageParams, this.workflowId, this.identifier)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.reset();
        this.workflowsInstances = data.content;
        this.updateWorkflowsData();
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

  private updateWorkflowsData(): void {
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
        .subscribe(
          data => {
            this.page = data;
            this.reset();
            this.workflowsInstances = data.content;
            this.updateWorkflowsData();
            this.cdRef.markForCheck();
            this.noInstancesFound = this.workflowsInstances.length === 0;
            console.log(this.noInstancesFound);
          },
          error => {
            console.error('Error fetching workflow instances', error);
            this.workflowsInstances = [];
            this.noInstancesFound = true;
            this.cdRef.markForCheck();
          }
        );
    } else {
      this.getPageItems(this.pageParams);
    }
  }

  public viewInstanceDetails(data: any): void {
    this.router.navigate(['/workflowinstance', data.id]);
  }
}
