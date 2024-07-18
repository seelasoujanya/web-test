import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { Workflow } from 'src/app/core/models/workflow.model';
import { DurationPipe } from 'src/app/shared/pipes/duration.pipe';
import { ApiService } from 'src/app/core/services/api.service';
@Component({
  selector: 'app-workflow-table',
  standalone: true,
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
  imports: [CommonModule, RouterOutlet, DurationPipe],
})
export class WorkflowTableComponent implements OnDestroy {
  @Input()
  public workflows: any[] = [];

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

  @Output()
  public getSortParam = new EventEmitter<any>();

  expandedInstaceId: number | undefined;

  stepList: any[] = [];

  logsResponse: string[] = [];

  downloadedFile: string | undefined;

  currentSort: 'asc' | 'desc' = 'asc';

  selectedHeading: string | undefined;

  headingEnum = {
    'Workflow Name': 'name',
    Status: 'enabled',
    'Last Run On': 'created',
    'Last Run Status': 'status',
    Priority: 'priority',
    'Queued On': 'created',
    'Started On': 'created',
    Duration: 'duration',
  };

  private destroyed$ = new Subject<void>();
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  public increaseLimitWorkflows(): void {
    this.increasePageEvent.emit(true);
  }

  public viewInstances(workflowId: number, workflowName: String): void {
    if (this.isWorkflow) {
      this.workflowDetailEvent.emit({ id: workflowId, name: workflowName });
    }
  }

  public viewInstanceDetails(workflowId: number): void {
    this.workflowDetailEvent.emit({ id: workflowId });
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

  public expandInstance(event: MouseEvent, workflow: Workflow) {
    event.stopPropagation();
    if (this.expandedInstaceId != workflow.id) {
      this.expandedInstaceId = workflow.id;
      this.getArtifactFiles(workflow);
      this.getInstancsLogs(workflow);
    } else {
      this.expandedInstaceId = undefined;
    }
  }

  sortColumn(heading: string) {
    this.selectedHeading = heading;
    if (this.currentSort === 'asc') {
      this.currentSort = 'desc';
    } else {
      this.currentSort = 'asc';
    }
    this.getSortParam.emit({ sortBy: heading, order: this.currentSort });
  }
}
