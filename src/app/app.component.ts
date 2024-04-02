import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'deliver-upgrade-frontend';

  addNumbers(a: number, b: number): boolean {
    const sum = a + b;
    if (sum > 10) {
      return true;
    }
    return false;
  }
}
