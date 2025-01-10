import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  @Input()
  public title: string = '';

  @Input()
  public description: string = '';

  @Input()
  public workflows: any;

  @Input()
  public applyButton: string = '';

  @Input()
  public cancelButton: string = '';

  @Input()
  public enableComments: boolean = false;

  @Output()
  public updateChanges = new EventEmitter<any>();

  templateDescription: string = '';

  public selectedWorkflows: number[] = [];

  constructor(private bsModalRef: BsModalRef) {}

  public onWorkflowSelect(event: any, workflow: any): void {
    if (event.target.checked) {
      this.selectedWorkflows.push(workflow.id);
    } else {
      this.selectedWorkflows = this.selectedWorkflows.filter(
        id => id !== workflow.id
      );
    }
  }

  public closeModal(): void {
    this.updateChanges.emit(false);
    this.bsModalRef.hide();
  }

  public confirmModal(): void {
    const result = this.enableComments ? this.templateDescription : true;
    this.updateChanges.emit({
      result,
      selectedWorkflows: this.selectedWorkflows,
    });
    this.bsModalRef.hide();
  }

  public cancelModal(): void {
    this.updateChanges.emit(false);
    this.bsModalRef.hide();
  }
}
