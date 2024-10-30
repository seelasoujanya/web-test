import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonTableComponent } from 'src/app/shared/components/common-table/common-table.component';
import { IPage } from 'src/app/core/models/page.model';
import { ApiService } from 'src/app/core/services/api.service';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { TimeFormatService } from 'src/app/time-format.service';

@Component({
  selector: 'app-processing-by-workflow',
  standalone: true,
  imports: [CommonModule, CommonTableComponent, PaginationComponent],
  templateUrl: './processing-by-workflow.component.html',
  styleUrls: ['./processing-by-workflow.component.scss'],
  providers: [DatePipe],
})
export class ProcessingByWorkflowComponent implements OnInit {
  workflows: any[] = [];
  isUTC = false;
  websocketSubscription!: Subscription;

  public pageParams = this.getDefaultPageParams();
  page!: IPage<any>;
  getDefaultPageParams() {
    return { page: 0, size: 10 };
  }

  headings: string[] = [
    'Workflow Name',
    'Running',
    'Pending',
    'Last Run',
    'Pause',
  ];

  constructor(
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private timeFormatService: TimeFormatService,
    private webSocketAPI: WebSocketAPI
  ) {}

  ngOnInit(): void {
    this.websocketSubscription =
      this.webSocketAPI.statusCountByWorkflow.subscribe(data => {
        this.workflows = data;
      });
    this.initialValues();
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  initialValues() {
    this.apiService.retrieveStatusCountByWorkflow().subscribe(
      data => {
        this.workflows = data;
        this.cd.detectChanges();
      },
      error => {
        console.error('Error fetching workflow data', error);
      }
    );
  }

  get workflowValues(): any[] {
    if (this.workflows) {
      const values = this.workflows.map(workflow => [
        workflow.workflowName,
        workflow.totalInstances.runningCount,
        workflow.totalInstances.pendingCount,
        `${this.datePipe.transform(workflow.completed, 'MMM dd, yyyy', this.isUTC ? 'UTC' : 'GMT+5:30')}<br/>` +
          `${this.datePipe.transform(workflow.completed, 'HH:mm:ss', this.isUTC ? 'UTC' : 'GMT+5:30')}`,
        { isPaused: workflow.paused, id: workflow.workflowId },
      ]);
      return values;
    }
    return [];
  }

  handleToggleChange(event: { id: any; state: boolean }) {
    const workflow = this.workflows.find(w => w.workflowId === event.id);
    if (workflow) {
      // Update the workflow in the backend
      this.apiService
        .updateWorkflow(workflow.workflowId, { enabled: event.state })
        .subscribe(response => {
          if (response) {
            console.log('Workflow updated successfully:', response);
            this.initialValues();
          } else {
            console.error('Failed to update workflow.');
          }
        });
    } else {
      console.warn(`Workflow with ID ${event.id} not found.`);
    }
  }
}
