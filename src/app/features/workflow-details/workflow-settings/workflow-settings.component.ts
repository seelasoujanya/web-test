import { Component, Input, TemplateRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { WorkflowStepSettingsComponent } from 'src/app/shared/components/workflow-step-settings/workflow-step-settings.component';
import { XmlStepSettingsComponent } from '../../../shared/components/workflow-step-settings/xml-step-settings/xml-step-settings.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-workflow-settings',
  standalone: true,
  imports: [
    NgSelectModule,
    MatSlideToggleModule,
    CommonModule,
    FormsModule,
    WorkflowStepSettingsComponent,
    XmlStepSettingsComponent,
    TooltipModule,
  ],
  templateUrl: './workflow-settings.component.html',
  styleUrl: './workflow-settings.component.scss',
  providers: [BsModalService],
})
export class WorkflowSettingsComponent {
  @Input()
  workflowId: string | null = '';

  headings: string[] = [];
  executionOrders: number[] = []; // Store all execution orders

  selectedHeading: string = '';

  selectedStepType: string | null = null;

  steps = [
    { label: 'SFTP', value: 'SFTP' },
    { label: 'GCS', value: 'GCS_UPLOADER' },
    { label: 'XML RUNNER', value: 'XML_RUNNER' },
    { label: 'S3 Bucket', value: 'S3_UPLOADER' },
  ];

  showConfigs: boolean | undefined;

  workflowSteps: IWorkflowStep[] = [];
  public pageParams = this.getDefaultPageParams();

  getDefaultPageParams() {
    return {
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    };
  }

  workflowStp = {
    executionOrder: 0,
    name: '',
    type: null,
    description: '',
    workflowStepConfigurations: [],
  };

  constructor(
    private apiServie: ApiService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.initialRender();
  }
  private destroyed$ = new Subject<void>();
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  initialRender() {
    if (this.workflowId) {
      this.apiServie
        .getWorkflowSteps(this.workflowId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: data => {
            this.workflowSteps = data;
            this.workflowSteps.forEach(dd => {
              this.headings.push(dd.name);
              this.executionOrders.push(dd.executionOrder);
            });
            this.selectedHeading =
              this.headings.length === 0 ? '' : this.headings[0];
            this.showConfigs = this.headings.length === 0;
          },
          error: error => {
            console.error(error);
          },
        });
    }
  }
  checkExecutionOrder() {
    this.isDuplicateExecutionOrder();
  }
  isDuplicateExecutionOrder(): boolean {
    return this.executionOrders.includes(this.workflowStp?.executionOrder);
  }

  selectStepType(event: any) {
    this.workflowStp.type = event.value;
    this.workflowStp.name = event.label;
  }
  onHeadingClick(type: string): void {
    this.selectedHeading = type;
  }

  updateWorkflowStep(workflowStep: IWorkflowStep | null): void {
    if (workflowStep) {
      const index = this.workflowSteps.findIndex(
        step => step.id === workflowStep.id
      );
      this.workflowSteps[index] = workflowStep;
    }
  }

  openCreateStepsModal(template: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(template, config);
  }

  createWorkflowWorkflowStep(): void {
    if (this.workflowId && this.workflowStp && this.workflowStp.type) {
      const workflowStepDto = {
        workflowId: parseInt(this.workflowId),
        executionOrder: this.workflowSteps.length + 1,
        type: this.workflowStp.type,
        name: this.workflowStp.name,
        description: this.workflowStp.description,
        workflowStepConfigurations: [],
      };
      this.apiServie.createStep(workflowStepDto).subscribe({
        next: response => {
          this.bsModalRef.hide();
          this.closeModal();
          this.workflowSteps.push(response);
          this.executionOrders.push(response.executionOrder);
          this.showConfigs = false;
          this.headings.push(response.name);
          this.selectedHeading = this.headings[this.headings.length - 1];
        },
      });
    }
  }
  closeModal() {
    this.bsModalRef.hide();
    this.workflowStp = {
      executionOrder: 0,
      name: '',
      type: null,
      description: '',
      workflowStepConfigurations: [],
    };
  }
}
