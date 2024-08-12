import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IStepConfiguration } from 'src/app/core/models/step-configuration.model';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';

@Component({
  selector: 'app-ftp-uploader-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ftp-uploader-settings.component.html',
  styleUrl: './ftp-uploader-settings.component.scss',
})
export class FtpUploaderSettingsComponent {
  fields: { key: string; label: string }[] = [
    { key: 'sftp_host', label: 'Host' },
    { key: 'sftp_username', label: 'Username' },
    { key: 'sftp_password', label: 'Password' },
    { key: 'sftp_port', label: 'Port' },
    { key: 'sftp_remote_path', label: 'Remote Path' },
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
    console.log(this.fields);
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
