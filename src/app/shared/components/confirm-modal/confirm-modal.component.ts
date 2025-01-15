import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
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
