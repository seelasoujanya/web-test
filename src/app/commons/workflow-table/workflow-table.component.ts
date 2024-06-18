import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PaginationService } from 'src/app/services/pagination.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Router, RouterOutlet } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Workflow } from 'src/app/interfaces/workflow.model';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, RouterOutlet],
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
  providers: [PaginationService],
})
export class WorkflowTableComponent implements OnDestroy {
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

  @Output()
  public workflowUpdateEvent = new EventEmitter<any>();

  @Output()
  public getArtifactsEvent = new EventEmitter<any>();

  expandedInstaceId: number | undefined;

  stepList: any[] = [];

  logsResponse: string[] = [];

  downloadedFile: string | undefined;

  private destroyed$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  constructor(
    private paginationService: PaginationService,
    private apiService: ApiService,
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

  public pauseWorkflow(event: MouseEvent, workflow: Workflow): void {
    event.stopPropagation();
    if (this.isWorkflow) {
      this.workflowUpdateEvent.emit(workflow);
    }
  }

  public getArtifactFiles(workflow: Workflow): void {
    if (!this.isWorkflow) {
      this.apiService.getArtifacts(workflow.id).subscribe(result => {
        this.stepList = result;
      });
    }
  }

  public getInstancsLogs(workflow: Workflow): void {
    if (!this.isWorkflow) {
      this.apiService.getLogsForInstance(workflow.id).subscribe(result => {
        this.logsResponse = result.split('[');
      });
    }
  }

  public downloadArtifact(artifactId: number, fileName: string): void {
    if (!this.isWorkflow) {
      this.apiService.downloadArtifact(artifactId).subscribe(
        response => {
          const blob = new Blob([response], {
            type: 'application/octet-stream',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style.display = 'none';
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error => {
          console.error('Error downloading file:', error);
        }
      );
    }
  }

  public expandInstance(workflow: Workflow) {
    if (this.expandedInstaceId != workflow.id) {
      this.expandedInstaceId = workflow.id;
      this.getArtifactFiles(workflow);
      this.getInstancsLogs(workflow);
    } else {
      this.expandedInstaceId = undefined;
    }
  }
}
