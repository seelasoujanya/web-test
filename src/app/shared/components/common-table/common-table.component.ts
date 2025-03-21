import { CommonModule, NgFor } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TimeFormatService } from '../../../time-format.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from 'src/app/core/services/api.service';
import { SystemProperty } from 'src/app/core/models/workflow.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-table',
  standalone: true,
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.scss'],
  imports: [CommonModule, NgFor, MatSlideToggleModule],
})
export class CommonTableComponent {
  @Input() headings: string[] = [];
  @Input() values: any[] = [];
  private previousValues: any[] = [];
  expandedId: number | undefined;
  @Input() showActions: boolean = false;
  @Input() isToggle: boolean = false;
  pausedProperty: SystemProperty | undefined;
  websocketSubscription!: Subscription;

  isUTC = false;
  toggleStates: { [key: string]: boolean } = {};
  isPauseProperty: boolean = false;
  isQueuedInstance: boolean = false;

  @Output() editPriority: EventEmitter<any> = new EventEmitter();
  @Output() terminateInstance: EventEmitter<any> = new EventEmitter();
  @Output() navToWorkflowId: EventEmitter<any> = new EventEmitter();
  @Output() navToInstanceId: EventEmitter<any> = new EventEmitter();
  @Output() navToWorkflowName: EventEmitter<any> = new EventEmitter();
  @Output() toggleChange: EventEmitter<{ id: any; state: boolean }> =
    new EventEmitter();

  @Output() template: EventEmitter<any> = new EventEmitter();

  constructor(
    private timeFormatService: TimeFormatService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private webSocketAPI: WebSocketAPI,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updatePausedProperty('paused');
    this.updatePausedPropertyFromWebSocket();
    this.initializeToggleStates();
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  updatePausedPropertyFromWebSocket() {
    this.websocketSubscription = this.webSocketAPI.pausedStatus.subscribe(
      pausedProperty => {
        this.isPauseProperty = pausedProperty ? true : false;
      }
    );
  }

  updatePausedProperty(key: string): void {
    this.apiService.getPausedProperty(key).subscribe((data: SystemProperty) => {
      this.pausedProperty = data;
      this.isPauseProperty = data.value === 'true' ? true : false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['values']) {
      if (!this.areArraysEqual(this.values, this.previousValues)) {
        this.initializeToggleStates();
        this.previousValues = [...this.values];
      }
    }
  }

  private areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  private initializeToggleStates() {
    if (!Array.isArray(this.values)) {
      console.error("Expected 'values' to be an array but got:", this.values);
      return;
    }
    this.values.forEach(row => {
      const id = row[4]?.id;
      if (id !== undefined) {
        this.toggleStates[id] = row[4]?.isPaused || false;
      }
    });
    this.cdr.detectChanges();
  }

  isToggleChange(isPasued: any) {
    if (this.isPauseProperty) {
      return true;
    } else {
      return isPasued;
    }
  }

  onToggle(event: Event, row: any) {
    event.stopPropagation();
    const rowId = row[4]?.id;
    if (this.isPauseProperty) {
      this.toggleStates[rowId] = true;
    } else {
      if (rowId !== undefined) {
        this.toggleStates[rowId] = !this.toggleStates[rowId];
        this.toggleChange.emit({ id: rowId, state: this.toggleStates[rowId] });
      }
    }
  }

  isObject(value: any): boolean {
    // this.isToggle = value.isToggle;
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  onEditPriority(row: any) {
    if (row[2] !== 'QUEUED') {
      this.editPriority.emit(row);
    } else {
      this.toastr.error('Unable to Change Priority');
    }
  }

  onTerminateInstance(row: any) {
    if (row[2] !== 'QUEUED') {
      this.terminateInstance.emit(row[0]);
    } else {
      this.toastr.error('Unable to Terminate The Instance');
    }
  }

  expandAction(id: any) {
    this.expandedId = this.expandedId === id ? undefined : id;
  }

  onRowClick(row: any) {
    if (this.isToggle) {
      this.navToWorkflowName.emit(row[0]);
    } else {
      const templateId = row[4]?.id;
      if (templateId !== undefined) {
        this.template.emit(templateId);
      }
    }
  }

  navigateToInstance(row: any): void {
    this.navToInstanceId.emit(row[0]);
  }

  navigateToWorkflow(row: any): void {
    this.navToWorkflowId.emit(row[0]);
  }
}
