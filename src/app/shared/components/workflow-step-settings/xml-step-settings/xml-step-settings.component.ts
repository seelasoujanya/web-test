import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-xml-step-settings',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule],
  templateUrl: './xml-step-settings.component.html',
  styleUrl: './xml-step-settings.component.scss',
})
export class XmlStepSettingsComponent {
  @Input()
  workflowStep: IWorkflowStep | null = null;

  enableEditing = false;
  availableKeys: string[] = [];

  selectedTemplateId: number | undefined;

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

  public constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    console.log(this.workflowStep);
    if (this.workflowStep?.workflowId) {
      this.apiService.getAllTemplates(this.pageParams).subscribe({
        next: data => {
          this.templates = data.content;
          console.log(this.templates, 'templates');
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

  updateTemplate(): void {
    if (this.workflowStep) {
      const body = {
        workflowStepId: this.workflowStep.id,
        templateId: this.selectedTemplateId,
      };
      if (this.hasSelectedTemplate) {
        this.apiService
          .updateTemplateForStep(this.workflowStep.workflowId, body)
          .subscribe({
            next: data => {
              console.log(data);
            },
            error: error => {
              console.error(error);
            },
          });
      } else {
        this.apiService.postTemplateForStep(body).subscribe({
          next: data => {
            console.log(data);
            this.hasSelectedTemplate = true;
          },
          error: error => {
            console.error(error);
          },
        });
      }
    }
  }
}
