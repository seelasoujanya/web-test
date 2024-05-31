import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workflow } from 'src/app/interfaces/workflow.model';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
})
export class WorkflowTableComponent {
  @Input() workflows: any[] = [];

  headings: string[] = [
    'ID',
    'WORKFLOW NAME',
    'STATUS',
    'LAST RUN ON',
    'LAST RUN STATUS',
    'ACTIONS',
  ];
}
