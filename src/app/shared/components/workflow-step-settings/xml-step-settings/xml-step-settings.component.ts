import { Component, Input } from '@angular/core';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { routes } from 'src/app/main/app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-xml-step-settings',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, TooltipModule],
  templateUrl: './xml-step-settings.component.html',
  styleUrl: './xml-step-settings.component.scss',
  providers: [BsModalService],
})
export class XmlStepSettingsComponent {
  @Input()
  workflowStep: IWorkflowStep | null = null;

  enableEditing = false;
  availableKeys: string[] = [];

  selectedTemplateId: number | undefined;

  originalTemplateId: number | undefined;

  fileName: String | undefined;

  hasSelectedTemplate = false;

  templates: {
    id: number;
    name: string;
    description: string;
  }[] = [];

  pageParams = {
    page: 0,
    pazeSize: 10,
    sortBy: '',
    order: 'asc',
  };

  public constructor(
    private apiService: ApiService,
    private spinnerService: SpinnerService,
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.workflowStep?.workflowId) {
      this.apiService.getAllTemplates(this.pageParams).subscribe({
        next: data => {
          this.templates = data.content;
        },
        error: error => {
          console.error(error);
        },
      });

      this.apiService
        .getSelectedTemplate(this.workflowStep.workflowId)
        .subscribe({
          next: data => {
            if (data.length > 0) {
              this.selectedTemplateId = data[0].templateId;
              this.originalTemplateId = data[0].templateId;
            }
          },
          error: error => {
            console.error(error);
          },
        });
    }
  }

  toggleEditing(): void {
    this.enableEditing = !this.enableEditing;
  }

  saveTemplateChanges() {
    const modalData = {
      title: 'Confirm Changes',
      description: `Are you sure you want to Save changes for XML Settings?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    this.openConfirmModal(modalData);
  }

  openConfirmModal(modalData: any) {
    this.bsModalRef = this.modalService.show(ConfirmModalComponent);
    this.bsModalRef.content.title = modalData.title;
    this.bsModalRef.content.description = modalData.description;
    this.bsModalRef.content.applyButton = modalData.btn1Name;
    this.bsModalRef.content.cancelButton = modalData.btn2Name;
    this.bsModalRef.content.updateChanges.subscribe((result: boolean) => {
      if (result) {
        this.updateTemplate();
        this.createworkflowStepConfig();
      } else {
        this.cancelChanges();
      }
      this.enableEditing = false;
    });
  }

  public cancelChanges() {
    this.enableEditing = false;
    this.selectedTemplateId = this.originalTemplateId;
  }

  updateTemplate(): void {
    if (this.workflowStep) {
      const body = {
        workflowStepId: this.workflowStep.id,
        templateId: this.selectedTemplateId,
      };
      this.spinnerService.show();
      this.apiService.postTemplateForStep(body).subscribe({
        next: data => {
          this.spinnerService.hide();
        },
        error: error => {
          this.spinnerService.hide();
        },
      });
    }
  }

  viewTemplate() {
    this.router.navigate(['templates', this.selectedTemplateId]);
  }

  createworkflowStepConfig() {}
}
