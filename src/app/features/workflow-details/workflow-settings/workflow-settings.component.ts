import { Component, Input } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { WorkflowStepSettingsComponent } from 'src/app/shared/components/workflow-step-settings/workflow-step-settings.component';
import { XmlStepSettingsComponent } from '../../../shared/components/workflow-step-settings/xml-step-settings/xml-step-settings.component';

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
  ],
  templateUrl: './workflow-settings.component.html',
  styleUrl: './workflow-settings.component.scss',
})
export class WorkflowSettingsComponent {
  @Input()
  workflowId: string | null = '';

  headings: string[] = [];
  selectedHeading: string = '';

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

  constructor(private apiServie: ApiService) {}

  ngOnInit(): void {
    if (this.workflowId) {
      this.apiServie.getWorkflowSteps(this.workflowId).subscribe({
        next: data => {
          this.workflowSteps = data;
          this.workflowSteps.forEach(dd => {
            this.headings.push(dd.name);
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
}
