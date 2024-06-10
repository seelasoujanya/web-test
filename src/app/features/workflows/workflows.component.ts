import { Component, importProvidersFrom } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkflowTableComponent } from 'src/app/commons/workflow-table/workflow-table.component';
import { Workflow } from 'src/app/interfaces/workflow.model';
import { ApiService } from 'src/app/services/api.service';
import { PaginationService } from 'src/app/services/pagination.service';

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
}
