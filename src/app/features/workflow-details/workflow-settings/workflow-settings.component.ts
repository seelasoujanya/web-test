import { Component, Input } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { GcsUploaderSettingsComponent } from '../../../shared/components/workflow-step-settings/gcs-uploader-settings/gcs-uploader-settings.component';
import { FtpUploaderSettingsComponent } from '../../../shared/components/workflow-step-settings/ftp-uploader-settings/ftp-uploader-settings.component';

@Component({
  selector: 'app-workflow-settings',
  standalone: true,
  imports: [
    NgSelectModule,
    MatSlideToggleModule,
    CommonModule,
    FormsModule,
    GcsUploaderSettingsComponent,
    FtpUploaderSettingsComponent,
  ],
  templateUrl: './workflow-settings.component.html',
  styleUrl: './workflow-settings.component.scss',
})
export class WorkflowSettingsComponent {
  @Input()
  workflowId: string | null = '';

  workflowSteps: IWorkflowStep[] = [];

  constructor(private apiServie: ApiService) {}

  ngOnInit(): void {
    if (this.workflowId) {
      this.apiServie.getWorkflowStepConfigurations(this.workflowId).subscribe({
        next: data => {
          this.workflowSteps = data;
        },
        error: error => {
          console.error(error);
        },
      });
    }
  }

  updateWorkflowStep(workflowStep: IWorkflowStep | null): void {
    if (workflowStep) {
      const index = this.workflowSteps.findIndex(
        step => step.id === workflowStep.id
      );
      this.workflowSteps[index] = workflowStep;
    }
  }
}
