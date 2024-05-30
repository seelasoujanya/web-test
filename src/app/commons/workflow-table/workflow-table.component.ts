import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-table.component.html',
  styleUrl: './workflow-table.component.scss',
})
export class WorkflowTableComponent {
  @Input() workflows: any[] = [];

  headings = [
    'ID',
    'Workflow Name',
    'Status',
    'Last Run On',
    'Last Run Status',
    'Actions',
  ];
}
