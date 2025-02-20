import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  finalize,
  forkJoin,
  interval,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import {
  WorkflowInstance,
  WorkflowInstanceStatus,
} from 'src/app/core/models/workflowinstance.model';
import { TimeFormatService } from 'src/app/time-format.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NavigationService } from 'src/app/navigation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';

@Component({
  selector: 'app-workflow-detail-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipModule],
  templateUrl: './workflow-instance-detail-view.component.html',
  styleUrl: './workflow-instance-detail-view.component.scss',
  providers: [ApiService],
})
export class WorkflowDetailViewComponent implements OnDestroy, OnInit {
  private destroyed$ = new Subject<void>();
  intervalSubscription: Subscription | null = null;
  isUTC = false;

  public ngOnDestroy(): void {
    if (this.intervalSubscription && !this.intervalSubscription.closed) {
      this.intervalSubscription.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
    this.intervalSubscription = interval(5000)
      .pipe(
        startWith(0),
        takeWhile(
          () =>
            this.workflowsInstance.status !==
              WorkflowInstanceStatus.COMPLETED &&
            this.workflowsInstance.status !== WorkflowInstanceStatus.FAILED
        ),
        switchMap(() => {
          // this.spinnerService.show();
          return forkJoin({
            logs: this.apiService
              .getLogsForInstance(this.workflowInstanceId)
              .pipe(catchError(() => of(null))),
            details: this.apiService
              .getWorkflowInstanceDetails(this.workflowInstanceId)
              .pipe(catchError(() => of(null))),
            artifacts: this.apiService
              .getArtifacts(this.workflowInstanceId)
              .pipe(catchError(() => of(null))),
          }).pipe(finalize(() => this.spinnerService.hide()));
        })
      )
      .subscribe({
        next: ({ logs, details, artifacts }) => {
          this.logsResponse = logs ?? '';
          this.workflowsInstance = details;
          this.filteredFiles = artifacts;
          this.cdRef.markForCheck();
        },
      });
  }

  workflowsInstance = {} as WorkflowInstance;
  logsResponse: string = '';
  filteredFiles: any[] = [];
  identifier: string = '';
  public workflowInstanceId: string | null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private timeFormatService: TimeFormatService,
    private navigationService: NavigationService,
    private spinnerService: SpinnerService
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
      this.navigationService.clearHistory();
      this.router.navigate(['workflows', workflowId], {
        queryParams: { tab: 'history' },
      });
    } else {
      this.router.navigate(['/workflows']);
    }
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
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    const milliseconds = Math.floor((ms % 1000) / 10);

    let formattedTime = '';

    if (hours > 0) formattedTime += `${hours}h `;
    if (minutes > 0) formattedTime += `${minutes}m `;
    if (seconds > 0) formattedTime += `${seconds}s `;
    if (milliseconds >= 0 && !(minutes > 0) && !hours)
      formattedTime += `${milliseconds}ms`;

    return formattedTime.trim();
  }
}
