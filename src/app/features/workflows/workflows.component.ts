import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { IPage } from 'src/app/core/models/page.model';
import { Workflow } from 'src/app/core/models/workflow.model';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { FormsModule } from '@angular/forms';
import { SpinnerService } from 'src/app/core/services/spinner.service';
@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [WorkflowTableComponent, PaginationComponent, FormsModule],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [ApiService],
})
export class WorkflowsComponent implements OnDestroy, OnInit {
  workflowsData: Workflow[] = [];

  workflowName: string = '';

  noWorkflows: boolean = false;

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
    private spinnerService: SpinnerService
  ) {}

  getPageItems(pageParams: any) {
    this.spinnerService.show();
    this.apiService
      .getWorkflows(pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.workflowsData = data.content;
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
      pageSize: 10,
      sortBy: '',
      order: 'asc',
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
    this.pageParams.search = this.workflowName;
    this.getPageItems(this.pageParams);
  }
}
