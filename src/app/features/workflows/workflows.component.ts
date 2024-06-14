import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { Workflow } from 'src/app/interfaces/workflow.model';
import { ApiService } from 'src/app/services/api.service';
import { PaginationService } from 'src/app/services/pagination.service';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [WorkflowTableComponent],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [ApiService, PaginationService],
})
export class WorkflowsComponent {
  workflowsData: Workflow[] = [];

  headings: string[] = [
    'Id',
    'Workflow Name',
    'Status',
    'Last Run On',
    'Last Run Status',
    'Actions',
  ];

  public workflows$: Observable<Workflow[]> =
    this.paginationService.workflowsList$;

  constructor(
    private paginationService: PaginationService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.paginationService.getWorkflows();
  }

  public increaseLimitWorkflows(isPage: boolean): void {
    if (isPage) {
      this.paginationService.page();
    }
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
      this.paginationService.updateWorkflow(workflow, result.enabled);
    });
  }
}
