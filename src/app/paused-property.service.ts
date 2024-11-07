import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemProperty } from './core/models/workflow.model';

@Injectable({
  providedIn: 'root',
})
export class PausedPropertyService {
  private pausedSubject = new BehaviorSubject<SystemProperty | null>(null);
  paused$ = this.pausedSubject.asObservable();

  setPausedProperty(pausedProperty: SystemProperty): void {
    this.pausedSubject.next(pausedProperty);
  }
}
