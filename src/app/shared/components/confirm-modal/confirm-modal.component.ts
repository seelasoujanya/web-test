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
  public applyButton: string = '';

  @Input()
  public cancelButton: string = '';

  @Input()
  public enableComments: boolean = false;

  @Output()
  public updateChanges = new EventEmitter<any>();

  templateDescription: string = '';

  constructor(private bsModalRef: BsModalRef) {}

  public closeModal(): void {
    this.bsModalRef.hide();
  }

  public confirmModal(): void {
    if (this.enableComments) {
      console.log('enabled', this.enableComments);
      this.updateChanges.emit(this.templateDescription);
    } else {
      this.updateChanges.emit(true);
    }
    this.bsModalRef.hide();
  }

  public cancelModal(): void {
    this.updateChanges.emit(false);
    this.bsModalRef.hide();
  }
}
