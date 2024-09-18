import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { IPage } from 'src/app/core/models/page.model';
import { Workflow } from 'src/app/core/models/workflow.model';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { FormsModule } from '@angular/forms';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [
    WorkflowTableComponent,
    PaginationComponent,
    FormsModule,
    CommonModule,
    TooltipModule,
  ],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [ApiService],
})
export class WorkflowsComponent implements OnDestroy, OnInit {
  workflowsData: Workflow[] = [];

  filteredWorkflows: Workflow[] = [];

  bookmarkedIds: number[] = [];

  workflowName: string = '';

  noWorkflows: boolean = false;

  BGroupId: string = '';

  headings: string[] = [
    'Workflow Name',
    'Status',
    'Last Run On',
    'Last Run Status',
    'Actions',
  ];

  headingEnum = {
    'Workflow Name': 'name',
    Status: 'enabled',
    'Last Run On': 'created',
    'Last Run Status': 'status',
  };

  public destroyed$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.getPageItems(this.pageParams);
  }

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private authorizationService: AuthorizationService
  ) {
    this.getUserId();
  }

  getPageItems(pageParams: any) {
    this.spinnerService.show();
    this.apiService
      .getWorkflows(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
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

  public pauseWorkflow(workflow: Workflow) {
    const newStatus = !workflow.enabled;
    const newData = {
      name: null,
      description: null,
      enabled: newStatus,
      throttleLimit: null,
      isTaskChainIsValid: null,
    };
    this.apiService.updateWorkflow(workflow.id, newData).subscribe(result => {
      workflow.enabled = result.enabled;
      this.cdRef.markForCheck();
    });
  }

  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.getPageItems(this.pageParams);
  }
  public page!: IPage<any>;
  public pageParams = this.getDefaultPageParams();

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
    this.pageParams.sortBy =
      this.headingEnum[heading as keyof typeof this.headingEnum];
    this.pageParams.order = event.order;
    this.getPageItems(this.pageParams);
  }

  searchWorkflow(): void {
    if (this.workflowName) {
      this.filteredWorkflows = this.workflowsData.filter(workflow =>
        workflow.name.toLowerCase().includes(this.workflowName.toLowerCase())
      );
    } else {
      this.filteredWorkflows = [...this.workflowsData];
    }
    this.noWorkflows = this.filteredWorkflows.length === 0;
    this.cdRef.detectChanges();
  }
  clearInput(): void {
    this.workflowName = '';
    this.filteredWorkflows = [...this.workflowsData];
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
    this.apiService.getBookmarkedWorkflowsByUsername(this.BGroupId).subscribe(
      bookmarkedWorkflows => {
        this.filteredWorkflows = bookmarkedWorkflows;
        this.noWorkflows = this.filteredWorkflows.length === 0;
        this.cdRef.markForCheck();
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error fetching bookmarked workflows', error);
        this.spinnerService.hide();
      }
    );
  }
}
