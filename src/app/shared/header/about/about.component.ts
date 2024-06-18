import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  standalone: true,
  selector: 'bmg-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [CommonModule],
})
export class AboutComponent {
  changeLogs: any = [];
  currentVersion: any = null;
  dataloaded: boolean = false;

  constructor(private bsModalRef: BsModalRef) {}

  public closeModal(isSuccess: boolean): void {
    this.bsModalRef.hide();
  }
}
