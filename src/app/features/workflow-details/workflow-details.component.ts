import { CommonModule, ɵnormalizeQueryParams } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { IPage } from 'src/app/core/models/page.model';
import { WorkflowInstance } from 'src/app/core/models/workflowinstance.model';
import { DurationPipe } from 'src/app/shared/pipes/duration.pipe';
import { FormsModule } from '@angular/forms';
import { WorkflowTableComponent } from 'src/app/shared/components/workflow-table/workflow-table.component';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkflowHistoryComponent } from './workflow-history/workflow-history.component';
import { WorkflowGeneralComponent } from './workflow-general/workflow-general.component';
import { WorkflowSettingsComponent } from './workflow-settings/workflow-settings.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { WorkflowStatisticsViewComponent } from './workflow-statistics-view/workflow-statistics-view.component';

@Component({
  selector: 'app-workflow-details',
  standalone: true,
  imports: [
    CommonModule,
    WorkflowTableComponent,
    DurationPipe,
    PaginationComponent,
    FormsModule,
    WorkflowHistoryComponent,
    WorkflowGeneralComponent,
    WorkflowSettingsComponent,
    WorkflowStatisticsViewComponent,
    RouterModule,
  ],
  templateUrl: './workflow-details.component.html',
  styleUrl: './workflow-details.component.scss',
  providers: [ApiService],
})
export class WorkflowDetailsComponent implements OnDestroy, OnInit {
  private destroyed$ = new Subject<void>();
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.getWorkflow();
    this.getEmailsByWorkflowId();
    this.route.queryParams.subscribe(params => {
      this.selectedTab = params['tab'] || 'general';
      this.selectTab(this.selectedTab);
    });
  }
  workflowsInstances: WorkflowInstance[] = [];
  identifier: string = '';
  noInstancesFound: boolean = false;
  selectedTab: string = 'general';

  instanceHeadings: string[] = [
    'Identifier',
    'Queued On',
    'Started On',
    'Duration',
    'Delivery Type',
    'Status',
    'Priority',
  ];

  headingEnum = {
    'Queued On': 'created',
    'Started On': 'created',
    Duration: 'duration',
    'Delivery Type': 'status',
    Status: 'status',
    Priority: 'priority',
  };

  public workflowId: string | null;

  public workflowName: string | undefined;

  public workflow: any | null;

  public emails: any[] = [];

  public workflowSteps: any[] = [];

  public workflowTemplates: any[] = [];

  public workflowCopy: any;

  deliveredInstancesCount = 0;
  totalInstancesCount = 0;
  failedInstancesCount = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private spinnerService: SpinnerService
  ) {
    this.workflowId = this.route.snapshot.params['id'];
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { name: string };
    if (state) {
      this.workflowName = state.name;
    }
  }

  public backToWorkflows(): void {
    this.router.navigate(['/workflows']);
  }

  updateWorkflowsData(): void {
    this.workflowsInstances.forEach(workflow => {
      if (
        workflow.status &&
        (workflow.status === 'FAILED' || workflow.status === 'CANCELLED')
      ) {
        this.failedInstancesCount++;
      } else if (
        workflow.status &&
        (workflow.status === 'CREATED' ||
          workflow.status === 'RUNNING' ||
          workflow.status === 'COMPLETED')
      ) {
        this.deliveredInstancesCount++;
      }
    });
    this.totalInstancesCount += this.workflowsInstances.length;
  }

  public reset() {
    this.failedInstancesCount = 0;
    this.deliveredInstancesCount = 0;
    this.totalInstancesCount = 0;
  }

  public viewInstanceDetails(data: any): void {
    this.router.navigate(['/workflowinstance', data.id]);
  }

  public selectTab(tab: string) {
    this.selectedTab = tab;
    this.router.navigate(['/workflows', this.workflowId], {
      queryParams: { tab: tab },
    });
  }

  public getWorkflow() {
    this.apiService
      .getWorkflowById(this.workflowId)
      .subscribe((result: any) => {
        this.workflow = result;
        this.workflowCopy = JSON.parse(JSON.stringify(result));
      });
  }
  public getEmailsByWorkflowId() {
    this.apiService
      .getEmailsByWorkflowId(this.workflowId)
      .subscribe((result: any) => {
        this.emails = result;
      });
  }

  public updateWorkflow(workflow: any) {
    this.spinnerService.show();
    this.apiService
      .updateWorkflow(this.workflowId, workflow)
      .subscribe((result: any) => {
        this.workflow = result;
        this.workflowCopy = JSON.parse(JSON.stringify(result));
        this.spinnerService.hide();
      });
  }

  public deleteEmailById(id: any) {
    this.spinnerService.show();
    this.apiService.deleteEmailById(id).subscribe((result: any) => {
      this.getEmailsByWorkflowId();
      this.spinnerService.hide();
    });
  }

  public workflowEmailSettings(emailData: any) {
    if (emailData) {
      if (emailData.action && emailData.action === 'DELETE') {
        this.deleteEmailById(emailData.emailId);
      }
      if (emailData.action && emailData.action === 'CREATE') {
        this.addEmail(emailData.data);
      }
      if (emailData.action && emailData.action === 'UPDATE') {
        this.updateEmail(emailData.emailId, emailData.data);
      }
    }
  }

  public addEmail(emailData: any) {
    console.log('emailData ' + emailData.email);
    this.spinnerService.show();
    this.apiService
      .addEmail(emailData.workflowId, emailData)
      .subscribe((result: any) => {
        this.emails.push(result);
        this.spinnerService.hide();
      });
  }

  public updateEmail(id: any, emailData: any) {
    this.spinnerService.show();
    this.apiService.updateEmail(id, emailData).subscribe((result: any) => {
      this.getEmailsByWorkflowId();
      this.spinnerService.hide();
    });
  }
}
