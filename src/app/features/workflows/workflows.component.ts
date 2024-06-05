import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { Workflow } from 'src/app/interfaces/workflow.model';
import { ApiService } from 'src/app/service/api.service';
import { WorkflowService } from 'src/app/service/workflow.service';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [WorkflowTableComponent, HttpClientModule, CommonModule],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [WorkflowService],
})
export class WorkflowsComponent {
  workflowsData: Workflow[] = [];

  constructor(private apiService: ApiService) {
    this.apiService.getWorkflows().subscribe(res => {
      this.workflowsData = res;
      console.log('response workflows', res);
    });
  }
}
