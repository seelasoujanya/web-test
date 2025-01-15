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
import { Router } from '@angular/router';

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
  fileName = '';
  xsdValidatorFiles: any[] = [];
  selectedValidatorFile: any;

  private pageParams = this.getDefaultPageParams();

  selectedTemplateId: number | undefined;
  selectedTemplateVersionId: number | undefined;
  originalTemplateId: number | undefined;
  originalTemplateVersion: number | undefined;

  templates: {
    id: number;
    name: string;
    description: string;
  }[] = [];

  templateVersions: {
    id: number;
  }[] = [];

  getDefaultPageParams() {
    return {
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    };
  }

  constructor(
    private apiService: ApiService,
    private spinnerService: SpinnerService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private router: Router
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
      if (this.workflowStep?.type == 'DDEX') {
        this.fetchTemplateData(this.workflowStep.workflowId);
      }
    }
    this.fetchXSDValidatorFiles();
  }

  fetchXSDValidatorFiles(): void {
    this.apiService.fetchXSDValidatorFiles().subscribe({
      next: (result: string[]) => {
        this.xsdValidatorFiles = result;
      },
      error: (err: any) => {
        console.error('Error fetching XSD validator files:', err);
      },
    });
  }

  fetchTemplateData = (workflowId: number) => {
    this.spinnerService.show();
    this.apiService.getAllTemplates(this.pageParams).subscribe({
      next: data => {
        this.templates = data.content;
        this.spinnerService.hide();
      },
      error: error => {
        console.error(error);
        this.spinnerService.hide();
      },
    });

    this.apiService.getSelectedTemplate(workflowId).subscribe({
      next: data => {
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].workflowStepId === this.workflowStep?.id) {
              this.selectedTemplateId = data[i].templateId;
              this.originalTemplateId = data[i].templateId;
              this.selectedTemplateVersionId = data[i].templateVersionId;
              this.originalTemplateVersion = data[i].templateVersionId;
              break;
            }
          }
        }
        this.fetchTemplateVersions(this.selectedTemplateId);
        this.spinnerService.hide();
      },
      error: error => {
        console.error(error);
        this.spinnerService.hide();
      },
    });
  };

  onTemplateChange(templateId: number | undefined): void {
    if (templateId) {
      this.fetchTemplateVersions(templateId);
    } else {
      this.templateVersions = [];
      this.selectedTemplateVersionId = undefined;
    }
  }

  fetchTemplateVersions = (selectedTemplateId: number | undefined) => {
    if (!selectedTemplateId) {
      this.templateVersions = [];
      this.selectedTemplateVersionId = undefined;
      return;
    }
    this.spinnerService.show();
    this.apiService
      .getTemplatesByTemplateId(selectedTemplateId, this.pageParams)
      .subscribe({
        next: data => {
          this.templateVersions = data;
          if (this.selectedTemplateVersionId) {
            const matchingVersion = this.templateVersions.find(
              version => version.id === this.selectedTemplateVersionId
            );
            this.selectedTemplateVersionId = matchingVersion
              ? matchingVersion.id
              : undefined;
          }

          this.spinnerService.hide();
        },
        error: error => {
          console.error(error);
          this.spinnerService.hide();
        },
      });
  };

  viewTemplate() {
    this.router.navigate(['templates', this.selectedTemplateId]);
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
        workflowStepId: this.workflowStep?.id,
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
    this.selectedTemplateVersionId = this.originalTemplateVersion;
    this.selectedTemplateId = this.originalTemplateId;
    if (this.originalWorkflowStep) {
      this.workflowStep = JSON.parse(JSON.stringify(this.originalWorkflowStep));
    }
    this.enableEditing = false;
  }

  updateTemplate(): void {
    if (this.workflowStep) {
      const body = {
        workflowStepId: this.workflowStep.id,
        templateId: this.selectedTemplateId,
        templateVersionId: this.selectedTemplateVersionId,
      };
      this.apiService.postTemplateForStep(body).subscribe({
        next: data => {
          this.originalTemplateId = this.selectedTemplateId;
          this.originalTemplateVersion = this.selectedTemplateVersionId;
        },
        error: error => {
          console.log('Error updating template', error);
        },
      });
    }
  }

  updateWorkflowStepSettings() {
    if (this.workflowStep) {
      this.spinnerService.show();

      if (
        (this.selectedTemplateId &&
          this.selectedTemplateId !== this.originalTemplateId) ||
        (this.selectedTemplateVersionId &&
          this.selectedTemplateVersionId !== this.originalTemplateVersion)
      ) {
        this.updateTemplate();
      }

      this.apiService
        .updateWorkflowStepConfigs(this.workflowStep.id, this.workflowStep)
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
