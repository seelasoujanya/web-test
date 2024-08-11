import { CommonModule, Location, LocationChangeEvent } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { DurationPipe } from 'src/app/shared/pipes/duration.pipe';
import { FormsModule } from '@angular/forms';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkflowInstance } from 'src/app/core/models/workflowinstance.model';

@Component({
  selector: 'app-workflow-detail-view',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowTableComponent,
    DurationPipe,
    PaginationComponent,
    FormsModule,
  ],
  templateUrl: './workflow-instance-detail-view.component.html',
  styleUrl: './workflow-instance-detail-view.component.scss',
  providers: [ApiService],
})
export class WorkflowDetailViewComponent implements OnDestroy, OnInit {
  private destroyed$ = new Subject<void>();

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.getPageItems();
    this.getArtifactFiles();
    this.getInstancsLogs();
  }

  workflowsInstance = {} as WorkflowInstance;
  selectedButton: string = 'xml';
  logsResponse: string = '';
  stepList: any[] = [];
  filteredFiles: any[] = [];
  identifier: string = '';
  public workflowInstanceId: string | null;
  selectedTab: string = 'summary';

  // noXmlFiles: boolean = false;
  // noFiles: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.workflowInstanceId = this.route.snapshot.params['id'];
  }

  getPageItems() {
    this.apiService
      .getWorkflowInstanceDetails(this.workflowInstanceId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.workflowsInstance = data;
        console.log(data);
        this.cdRef.markForCheck();
      });
  }

  getDefaultPageParams() {
    return {
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    };
  }

  public backToWorkflows(): void {
    this.router.navigate(['/workflows']);
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
        console.log(result, 'logsResponse');
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
}
