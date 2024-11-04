import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  COVER_ART,
  DATA_ONLY,
  FULL_DELIVERY,
  INSERT,
  PACKSHOT,
  SCREENGRAB,
  TAKE_DOWN,
} from 'src/app/core/utils/constants';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { SystemProperty, Workflow } from 'src/app/core/models/workflow.model';
import { DurationPipe } from 'src/app/shared/pipes/duration.pipe';
import { ApiService } from 'src/app/core/services/api.service';
import { TimeFormatService } from 'src/app/time-format.service';
@Component({
  selector: 'app-workflow-table',
  standalone: true,
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
  imports: [CommonModule, RouterOutlet, DurationPipe],
})
export class WorkflowTableComponent implements OnDestroy {
  public timeFormatService: TimeFormatService;

  @Input()
  public workflows: any[] = [];
  pausedProperty: SystemProperty | undefined;

  @Input()
  public headings: any[] = [];

  @Input()
  public isWorkflow: boolean = false;

  @Input()
  public bookmarkedIds: number[] = [];

  @Input()
  public workflowInstances$: Observable<any[]> | undefined;

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

  @Output()
  public reload = new EventEmitter<any>();

  @Output()
  public bookMarkEvent = new EventEmitter<any>();

  expandedInstaceId: number | undefined;

  stepList: any[] = [];

  logsResponse: string[] = [];

  downloadedFile: string | undefined;

  currentSort: 'asc' | 'desc' = 'asc';

  selectedHeading: string | undefined;

  isPauseProperty: boolean = true;

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
  isUTC = false;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    timeFormatService: TimeFormatService
  ) {
    this.timeFormatService = timeFormatService;
  }

  ngOnInit() {
    this.getPausedProperty('paused');

    // ITC TO UTC
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  formatDate(date: string | Date) {
    return this.timeFormatService.formatDate(date);
  }

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

  public bookMarkWorkflow(event: Event, workflow: Workflow): void {
    event.stopPropagation();
    if (this.isWorkflow) {
      this.bookMarkEvent.emit(workflow);
    }
  }
  isToggle(isPasued: any) {
    if (this.isPauseProperty) {
      return true;
    } else {
      return isPasued;
    }
  }

  togglePaused(event: Event, workflow: Workflow) {
    event.stopPropagation(); // Prevent the click event from bubbling up to the row
    // Your logic to handle the toggle here
    if (this.isPauseProperty) {
      workflow.paused = true;
    } else {
      workflow.paused = !workflow.paused;

      this.apiService
        .updateWorkflow(workflow.id, { paused: workflow.paused })
        .subscribe(response => {
          if (response) {
            this.reload.emit(workflow);
          } else {
            console.error('Failed to update workflow.');
          }
        });
    }
  }

  getPausedProperty(key: string): void {
    this.apiService.getPausedProperty(key).subscribe((data: SystemProperty) => {
      this.pausedProperty = data;
      this.isPauseProperty = data.value === 'true' ? true : false;
    });
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

  sortColumn(heading: string) {
    this.selectedHeading = heading;
    if (this.currentSort === 'asc') {
      this.currentSort = 'desc';
    } else {
      this.currentSort = 'asc';
    }
    this.getSortParam.emit({ sortBy: heading, order: this.currentSort });
  }

  getDisplayName(deliveryType: string): string {
    switch (deliveryType) {
      case DATA_ONLY:
        return 'Data Only';
      case PACKSHOT:
        return 'Packshot';
      case FULL_DELIVERY:
        return 'Full Delivery';
      case SCREENGRAB:
        return 'Screengrab';
      case COVER_ART:
        return 'Cover Art';
      case INSERT:
        return 'Insert';
      case TAKE_DOWN:
        return 'Takedown';
      default:
        return 'None';
    }
  }
}
