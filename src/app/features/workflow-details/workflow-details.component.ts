import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    this.getPageItems(this.pageParams);
    this.getWorkflow();
    this.getEmailsByWorkflowId();
    this.getWorkflowSteps(this.workflowId, this.pageParams);
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
    'Actions',
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

  public workflowStepId: number | undefined;

  public workflowCopy: any;

  deliveredInstancesCount = 0;
  totalInstancesCount = 0;
  failedInstancesCount = 0;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.workflowId = this.route.snapshot.params['id'];
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { name: string };
    if (state) {
      this.workflowName = state.name;
    }
  }

  getPageItems(pageParams: any) {
    this.apiService
      .getWorkflowInstances(pageParams, this.workflowId, this.identifier)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.reset();
        this.workflowsInstances = data.content;
        this.updateWorkflowsData();
        this.cdRef.markForCheck();
        this.noInstancesFound = false;
      });
  }
  onPage(pageNumber: number) {
    this.pageParams.page = pageNumber - 1;
    this.getPageItems(this.pageParams);
  }
  public page!: IPage<any>;
  private pageParams = this.getDefaultPageParams();

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

  sortColumn(event: any) {
    let heading = event.sortBy;
    this.pageParams.sortBy =
      this.headingEnum[heading as keyof typeof this.headingEnum];
    this.pageParams.order = event.order;
    this.getPageItems(this.pageParams);
  }

  private updateWorkflowsData(): void {
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

  searchWorkflowInstance(): void {
    if (this.identifier) {
      const id = this.identifier;
      this.apiService
        .getWorkflowInstances(
          this.pageParams,
          this.workflowId,
          this.identifier.toLowerCase()
        )
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          data => {
            this.page = data;
            this.reset();
            this.workflowsInstances = data.content;
            this.updateWorkflowsData();
            this.cdRef.markForCheck();
            this.noInstancesFound = this.workflowsInstances.length === 0;
            console.log(this.noInstancesFound);
          },
          error => {
            console.error('Error fetching workflow instances', error);
            this.workflowsInstances = [];
            this.noInstancesFound = true;
            this.cdRef.markForCheck();
          }
        );
    } else {
      this.getPageItems(this.pageParams);
    }
  }

  public viewInstanceDetails(data: any): void {
    this.router.navigate(['/workflowinstance', data.id]);
  }

  public selectTab(tab: string) {
    this.selectedTab = tab;
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
    this.apiService
      .updateWorkflow(this.workflowId, workflow)
      .subscribe((result: any) => {
        this.workflow = result;
        this.workflowCopy = JSON.parse(JSON.stringify(result));
      });
  }

  public deleteEmailById(id: any) {
    this.apiService.deleteEmailById(id).subscribe((result: any) => {
      console.log('deleted succesfully');
      this.getEmailsByWorkflowId();
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
    this.apiService
      .addEmail(this.workflow.id, emailData)
      .subscribe((result: any) => {
        this.emails.push(result);
      });
  }

  public updateEmail(id: any, emailData: any) {
    this.apiService.updateEmail(id, emailData).subscribe((result: any) => {
      this.getEmailsByWorkflowId();
    });
  }

  public getWorkflowSteps(id: any, pageParams: any) {
    this.apiService
      .getWorkflowSteps(id, pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.workflowSteps = data.content;
        this.cdRef.markForCheck();
        console.log('steps', this.workflowSteps);
        this.workflowSteps.forEach(step => {
          if (step.name === 'DDEX') {
            this.workflowStepId = step.id;
            console.log('stepId', this.workflowStepId);
          }
        });
        this.getTemplates(this.workflowStepId, this.pageParams);
      });
  }

  public getTemplates(id: any, pageParams: any) {
    this.apiService
      .getTemplatesByStepId(id, pageParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        this.page = data;
        this.workflowTemplates = data.content;
        this.cdRef.markForCheck();
        console.log('templates', this.workflowTemplates);
      });
  }
}
