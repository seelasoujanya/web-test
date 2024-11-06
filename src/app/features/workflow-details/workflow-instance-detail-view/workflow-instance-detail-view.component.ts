import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { DurationPipe } from 'src/app/shared/pipes/duration.pipe';
import { FormsModule } from '@angular/forms';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkflowInstance } from 'src/app/core/models/workflowinstance.model';
import { TimeFormatService } from 'src/app/time-format.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'app-workflow-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowTableComponent,
    DurationPipe,
    PaginationComponent,
    FormsModule,
    TooltipModule,
  ],
  templateUrl: './workflow-instance-detail-view.component.html',
  styleUrl: './workflow-instance-detail-view.component.scss',
  providers: [ApiService],
})
export class WorkflowDetailViewComponent implements OnDestroy, OnInit {
  private destroyed$ = new Subject<void>();
  isUTC = false;

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.getPageItems();
    this.getArtifactFiles();
    this.getInstancsLogs();
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  workflowsInstance = {} as WorkflowInstance;
  selectedButton: string = 'xml';
  logsResponse: string = '';
  stepList: any[] = [];
  filteredFiles: any[] = [];
  identifier: string = '';
  public workflowInstanceId: string | null;
  selectedTab: string = 'summary';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private timeFormatService: TimeFormatService
  ) {
    this.workflowInstanceId = this.route.snapshot.params['id'];
  }

  toggleTimeFormat() {
    this.timeFormatService.toggleTimeFormat();
  }

  formatDate(date: string | Date) {
    return this.timeFormatService.formatDate(date);
  }

  getPageItems() {
    this.apiService
      .getWorkflowInstanceDetails(this.workflowInstanceId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.workflowsInstance = data;
        this.cdRef.markForCheck();
      });
  }

  getDefaultPageParams() {
    return {
      page: 0,
      pageSize: 20,
      sortBy: '',
      order: 'asc',
    };
  }

  public backToWorkflows(): void {
    let workflowId = this.workflowsInstance?.workflow?.id;
    if (workflowId) {
      this.router.navigate(['workflows', workflowId], {
        queryParams: { tab: 'history' },
      });
    } else {
      this.router.navigate(['/workflows']);
    }
  }

  public selectTab(tab: string) {
    this.selectedTab = tab;
  }

  public getArtifactFiles(): void {
    this.apiService.getArtifacts(this.workflowInstanceId).subscribe(result => {
      this.filteredFiles = result;
    });
  }

  public getInstancsLogs(): void {
    this.apiService
      .getLogsForInstance(this.workflowInstanceId)
      .subscribe(result => {
        this.logsResponse = result;
      });
  }

  public downloadArtifact(artifactId: number, fileName: string): void {
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

  public getIcon(filename: string): string {
    const extension = filename.split('.').pop();
    switch (extension) {
      case 'xml':
        return '/assets/icons/xml-logo.svg';
      case 'json':
        return '/assets/icons/json-logo.svg';
      default:
        return 'assets/icons/default-file.svg';
    }
  }

  public convertMilliSeconds(ms: number | null): string {
    if (ms === null) {
      return '';
    }
    const hours = Math.floor(ms / 3600000); // 1 hour = 3600000 milliseconds
    const minutes = Math.floor((ms % 3600000) / 60000); // 1 minute = 60000 milliseconds
    const seconds = Math.floor((ms % 60000) / 1000); // 1 second = 1000 milliseconds
    const milliseconds = ms % 1000; // remainder milliseconds

    let formattedTime = '';

    if (hours > 0) formattedTime += `${hours}h `;
    if (minutes > 0) formattedTime += `${minutes}m `;
    if (seconds > 0) formattedTime += `${seconds}s `;
    if (milliseconds > 0) formattedTime += `${milliseconds}ms`;

    return formattedTime.trim();
  }
}
