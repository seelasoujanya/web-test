import { Component, Input } from '@angular/core';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  selector: 'app-xml-step-settings',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, TooltipModule],
  templateUrl: './xml-step-settings.component.html',
  styleUrl: './xml-step-settings.component.scss',
})
export class XmlStepSettingsComponent {
  @Input()
  workflowStep: IWorkflowStep | null = null;

  enableEditing = false;
  availableKeys: string[] = [];

  selectedTemplateId: number | undefined;

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
    private spinnerService: SpinnerService
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
}
