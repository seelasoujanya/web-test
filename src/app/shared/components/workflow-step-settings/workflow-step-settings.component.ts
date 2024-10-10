import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { IStepConfiguration } from 'src/app/core/models/step-configuration.model';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { IWorkflowStepField } from './field.model';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { stepFields } from './constants';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-workflow-step-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, TooltipModule],
  templateUrl: './workflow-step-settings.component.html',
  styleUrl: './workflow-step-settings.component.scss',
  providers: [BsModalService],
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

  enableEditing: boolean = false;
  availableKeys: string[] = [];
  originalWorkflowStep: IWorkflowStep | null = null;

  constructor(
    private apiService: ApiService,
    private spinnerService: SpinnerService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    if (this.workflowStep) {
      this.originalWorkflowStep = JSON.parse(JSON.stringify(this.workflowStep));
      const stepField = stepFields.find(
        ({ stepType }) => stepType === this.workflowStep?.type
      );
      if (stepField) {
        this.fields = stepField?.fields;
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
        workflowStepId: this.workflowStep?.id,
      } as IStepConfiguration);
    }
  }

  updateCheckboxFieldValue(key: string) {
    const config = this.workflowStep?.workflowStepConfigurations.find(
      config => config.key === key
    );
    if (config) {
      if (config.value === 'true') {
        config.value = 'false';
      } else if (config.value === 'false') {
        config.value = 'true';
      } else {
        config.value = config.value ? 'false' : 'true';
      }
    } else {
      this.workflowStep?.workflowStepConfigurations.push({
        key,
        value: true,
      } as IStepConfiguration);
    }
  }

  openConfirmModal(modalData: any) {
    this.bsModalRef = this.modalService.show(ConfirmModalComponent);
    this.bsModalRef.content.title = modalData.title;
    this.bsModalRef.content.description = modalData.description;
    this.bsModalRef.content.applyButton = modalData.btn1Name;
    this.bsModalRef.content.cancelButton = modalData.btn2Name;
    this.bsModalRef.content.updateChanges.subscribe((result: boolean) => {
      if (result) {
        this.updateWorkflowStepSettings();
      }
    });
  }

  saveWorkflowSettingsChanges(step: any) {
    const modalData = {
      title: 'Confirm Changes',
      description: `Are you sure you want to Save changes  for ${step} Settings?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    this.openConfirmModal(modalData);
  }

  public cancelChanges() {
    if (this.originalWorkflowStep) {
      this.workflowStep = JSON.parse(JSON.stringify(this.originalWorkflowStep));
    }
    this.enableEditing = false;
  }

  updateWorkflowStepSettings() {
    if (this.workflowStep) {
      this.spinnerService.show();
      this.apiService
        .updateWorkflowSteps(
          this.workflowStep.workflowId.toString(),
          this.workflowStep
        )
        .subscribe({
          next: data => {
            this.workflowStep = data;
            this.updateWorkflowStep();
            this.spinnerService.hide();
            this.enableEditing = false;
          },
          error: error => {
            console.error(error);
            this.spinnerService.hide();
            this.enableEditing = false;
          },
        });
    }
  }
}
