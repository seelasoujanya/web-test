import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'deliver-upgrade-frontend';
  constructor() {
    console.log(environment.env);
  }

  addNumbers(a: number, b: number): boolean {
    const sum = a + b;
    if (sum > 10) {
      return true;
    }
    return false;
  }
}
