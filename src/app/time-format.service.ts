import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimeFormatService {
  private isUTC = new BehaviorSubject<boolean>(false); // false for IST, true for UTC
  isUTC$ = this.isUTC.asObservable();

  toggleTimeFormat() {
    this.isUTC.next(!this.isUTC.value);
  }

  getCurrentTimeFormat() {
    return this.isUTC.value ? 'UTC' : 'Local';
  }
}
