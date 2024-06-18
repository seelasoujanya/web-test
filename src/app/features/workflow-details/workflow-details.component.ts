import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { WorkflowInstance } from 'src/app/interfaces/workflowinstance.model';
import { DurationPipe } from 'src/app/pipes/duration.pipe';
import { WorkflowDetailsPaginationService } from 'src/app/services/workflow-details-pagination.service';

@Component({
  selector: 'app-workflow-details',
  standalone: true,
  imports: [CommonModule, WorkflowTableComponent, DurationPipe],
  templateUrl: './workflow-details.component.html',
  styleUrl: './workflow-details.component.scss',
  providers: [WorkflowDetailsPaginationService],
})
export class WorkflowDetailsComponent implements OnDestroy {
  private destroyed$ = new Subject<void>();
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  workflowsInstances: WorkflowInstance[] = [];

  public errorInstances$: Observable<number> =
    this.paginationService.failedInstances$;

  public deliveredInstances$: Observable<number> =
    this.paginationService.deliveredInstances$;

  public totalInstancesCount$: Observable<number> =
    this.paginationService.totalInstancesCount$;

  instanceHeadings: string[] = [
    'Id',
    'Queued On',
    'Started On',
    'Duration',
    'Delivery Type',
    'Status',
    'Priority',
    'Actions',
  ];

  public workflowId: string | null;

  public workflowName: string | undefined;

  public workflowInstances$: Observable<WorkflowInstance[]> =
    this.paginationService.workflowInstanceList$;

  constructor(
    private paginationService: WorkflowDetailsPaginationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.workflowId = this.route.snapshot.params['id'];
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { name: string };
    if (state) {
      this.workflowName = state.name;
    }
    this.paginationService.getWorkflowInstances(Number(this.workflowId));
  }

  public increaseLimitWorkflows(isPage: boolean): void {
    if (isPage) {
      this.paginationService.page();
    }
  }

  public backToWorkflows(): void {
    this.router.navigate(['/workflows']);
  }
}
