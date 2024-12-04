import { Component, Input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './spinner-overlay.component.html',
  styleUrl: './spinner-overlay.component.scss',
})
export class SpinnerOverlayComponent {
  @Input()
  public message!: string;
  constructor() {}

  ngOnInit(): void {}
}
