import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { IStepConfiguration } from 'src/app/core/models/step-configuration.model';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { IWorkflowStepField } from './field.model';
import { stepFields } from './constants';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-workflow-step-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './workflow-step-settings.component.html',
  styleUrl: './workflow-step-settings.component.scss',
})
export class WorkflowStepSettingsComponent {
  @Input()
  title = '';

  @Input()
  fields: IWorkflowStepField[] = [];

  @Input()
  workflowStep: IWorkflowStep | null = null;

  @Output()
  workflowStepChange: EventEmitter<IWorkflowStep | null> =
    new EventEmitter<IWorkflowStep | null>();

  enableEditing = false;
  availableKeys: string[] = [];

  public constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.workflowStep?.type) {
      const stepFieldConfig = stepFields.find(
        ({ stepType }) => stepType === this.workflowStep?.type
      );
      if (stepFieldConfig) {
        this.title = stepFieldConfig?.title;
        this.fields = stepFieldConfig?.fields;
        this.availableKeys = this.fields.map(field => field.key);
      }
    }
  }

  toggleEditing(): void {
    this.enableEditing = !this.enableEditing;
  }

  updateWorkflowStep(): void {
    this.workflowStepChange.emit(this.workflowStep);
  }

  getFieldValue(
    key: string,
    type: 'string' | 'boolean' = 'string'
  ): string | boolean {
    const config = this.workflowStep?.workflowStepConfigurations.find(
      config => {
        return config.key === key;
      }
    );
    if (config) {
      if (type === 'boolean') {
        return config.value === 'true';
      }
      return config.value as string;
    }
    if (type === 'boolean') {
      return false;
    }
    return '';
  }

  setFieldValue(key: string, value: string): void {
    const config = this.workflowStep?.workflowStepConfigurations.find(
      config => config.key === key
    );
    if (config) {
      config.value = value;
    } else {
      this.workflowStep?.workflowStepConfigurations.push({
        key,
        value,
      } as IStepConfiguration);
    }
    this.updateWorkflowStep();
  }

  updateCheckboxFieldValue(key: string) {
    const config = this.workflowStep?.workflowStepConfigurations.find(
      config => config.key === key
    );
    if (config) {
      if (typeof config.value === 'boolean') {
        config.value = !config.value;
      } else {
        config.value = config.value !== 'true';
      }
    } else {
      this.workflowStep?.workflowStepConfigurations.push({
        key,
        value: true,
      } as IStepConfiguration);
    }
    this.updateWorkflowStep();
  }

  updateWorkflowStepSettings() {
    if (this.workflowStep) {
      this.apiService
        .updateWorkflowSteps(
          this.workflowStep.workflowId.toString(),
          this.workflowStep
        )
        .subscribe({
          next: data => {
            this.workflowStep = data;
          },
          error: error => {
            console.error(error);
          },
        });
    }
  }
}
