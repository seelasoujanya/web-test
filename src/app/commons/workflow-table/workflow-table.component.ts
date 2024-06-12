import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PaginationService } from 'src/app/services/pagination.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, RouterOutlet],
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
  providers: [PaginationService],
})
export class WorkflowTableComponent {
  @Input()
  public workflows$: Observable<any[]> | undefined;

  @Input()
  public headings: any[] = [];

  @Input()
  public isWorkflow: boolean = false;

  @Input()
  public workflowInstances$: Observable<any[]> | undefined;

  @Input()
  public instanceHeadings: string[] = [
    'ID',
    'Queued On',
    'Started On',
    'Duration',
    'Delivery Type',
    'Status',
    'Priority',
    'Actions',
  ];

  @Output()
  public increasePageEvent = new EventEmitter<boolean>();

  @Output()
  public workflowDetailEvent = new EventEmitter<any>();

  constructor(
    private paginationService: PaginationService,
    private router: Router
  ) {}

  public increaseLimitWorkflows(): void {
    this.increasePageEvent.emit(true);
  }

  public viewInstances(workflowId: number, workflowName: String): void {
    if (this.isWorkflow) {
      this.workflowDetailEvent.emit({ id: workflowId, name: workflowName });
    }
  }
}
