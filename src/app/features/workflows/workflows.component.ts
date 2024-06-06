import { Component } from '@angular/core';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { Workflow } from 'src/app/interfaces/workflow.model';
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [WorkflowTableComponent],
  templateUrl: './workflows.component.html',
  styleUrl: './workflows.component.scss',
  providers: [ApiService],
})
export class WorkflowsComponent {
  workflowsData: Workflow[] = [];

  constructor(private apiService: ApiService) {
    this.apiService.getWorkflows().subscribe(res => {
      this.workflowsData = res;
      console.log('result', this.workflowsData);
    });
  }
}
