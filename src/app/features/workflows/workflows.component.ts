import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { WorkflowService } from 'src/app/services/workflow.service';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [WorkflowTableComponent, HttpClientModule, CommonModule],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [WorkflowService],
})
export class WorkflowsComponent {
  workflowsData: any[] = [];

  constructor(private workflowService: WorkflowService) {
    this.workflowService.getWorkflows().subscribe(res => {
      this.workflowsData = res;
    });
  }
}
