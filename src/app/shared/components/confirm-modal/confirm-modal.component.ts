import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
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

  @Output()
  public updateChanges = new EventEmitter<boolean>();

  constructor(private bsModalRef: BsModalRef) {}

  public closeModal(): void {
    this.bsModalRef.hide();
  }

  public confirmModal(): void {
    this.updateChanges.emit(true);
    this.bsModalRef.hide();
  }

  public cancelModal(): void {
    this.updateChanges.emit(false);
    this.bsModalRef.hide();
  }
}
