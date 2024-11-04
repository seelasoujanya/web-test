import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root',
})
export class TimeFormatService {
  private isUTC = new BehaviorSubject<boolean>(false); // false for local, true for UTC
  isUTC$ = this.isUTC.asObservable();

  private localTimeZone: string =
    Intl.DateTimeFormat().resolvedOptions().timeZone; // Get the user's local time zone
  currentTimeZone = new BehaviorSubject<string>(this.localTimeZone);
  currentTimeZone$ = this.currentTimeZone.asObservable();

  toggleTimeFormat() {
    this.isUTC.next(!this.isUTC.value);
  }

  getCurrentTime(): string {
    const currentTime = this.isUTC.value
      ? moment.utc()
      : moment.tz(this.localTimeZone);
    return currentTime.format('MMM DD, YYYY HH:mm:ss');
  }

  formatDate(date: string | Date): { date: string; time: string } {
    if (!date) return { date: 'NA', time: '' };

    const momentDate = moment(date);
    const formattedDate = this.isUTC.value
      ? momentDate.utc().format('MMM DD, YYYY')
      : momentDate.tz(this.localTimeZone).format('MMM DD, YYYY');

    const formattedTime = this.isUTC.value
      ? momentDate.utc().format('HH:mm:ss')
      : momentDate.tz(this.localTimeZone).format('HH:mm:ss');

    return { date: formattedDate, time: formattedTime };
  }
}
