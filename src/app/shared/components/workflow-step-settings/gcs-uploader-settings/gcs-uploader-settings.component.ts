import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IStepConfiguration } from 'src/app/core/models/step-configuration.model';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';

@Component({
  selector: 'app-gcs-uploader-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gcs-uploader-settings.component.html',
  styleUrl: './gcs-uploader-settings.component.scss',
})
export class GcsUploaderSettingsComponent {
  fields: { key: string; label: string }[] = [
    { key: 'gcs_service_account', label: 'Service Account' },
    { key: 'gcs_bucket_name', label: 'Bucket Name' },
  ];
  availableKeys: string[] = [];

  @Input()
  workflowStep: IWorkflowStep | null = null;

  @Output()
  workflowStepChange: EventEmitter<IWorkflowStep | null> =
    new EventEmitter<IWorkflowStep | null>();

  updateWorkflowStep(): void {
    this.workflowStepChange.emit(this.workflowStep);
  }

  ngOnInit(): void {
    this.availableKeys = this.fields.map(field => field.key);
  }

  getFieldValue(key: string): string {
    const config = this.workflowStep?.workflowStepConfigurations.find(
      config => config.key === key
    );
    if (config) {
      return config.value;
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
}
