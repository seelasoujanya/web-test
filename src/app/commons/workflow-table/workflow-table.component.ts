import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workflow } from 'src/app/interfaces/workflow.model';
import { Observable } from 'rxjs';
import { PaginationService } from 'src/app/services/pagination.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule],
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
  providers: [PaginationService],
})
export class WorkflowTableComponent {
  public workflows$: Observable<Workflow[]> =
    this.paginationService.workflowsList$;

  constructor(private paginationService: PaginationService) {
    this.paginationService.getWorkflows();
  }

  headings: string[] = [
    'Id',
    'Workflow Name',
    'Status',
    'Last Run On',
    'Last Run Status',
    'Actions',
  ];

  public increaseLimitWorkflows(): void {
    this.paginationService.page();
  }
}
