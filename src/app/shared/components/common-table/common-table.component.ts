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
  expandedId: number | undefined;
  @Input() showActions: boolean = false;
  @Input() isToggle: boolean = false;

  isUTC = false;
  toggleStates: { [key: string]: boolean } = {};

  @Output() editPriority: EventEmitter<any> = new EventEmitter();
  @Output() terminateInstance: EventEmitter<any> = new EventEmitter();
  @Output() toggleChange: EventEmitter<{ id: any; state: boolean }> =
    new EventEmitter();

  @Output() template: EventEmitter<any> = new EventEmitter();

  constructor(
    private timeFormatService: TimeFormatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeToggleStates();
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['values']) {
      this.initializeToggleStates();
    }
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
      } else {
        console.warn('Row ID is undefined:', row);
      }
    });
    this.cdr.detectChanges();
  }

  onToggle(row: any) {
    const rowId = row[4]?.id;
    if (rowId !== undefined) {
      this.toggleStates[rowId] = !this.toggleStates[rowId];
      this.toggleChange.emit({ id: rowId, state: this.toggleStates[rowId] });
    }
  }

  isObject(value: any): boolean {
    // this.isToggle = value.isToggle;
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  onEditPriority(row: any) {
    this.editPriority.emit(row);
  }

  onTerminateInstance(row: any) {
    this.terminateInstance.emit(row);
  }

  expandAction(id: any) {
    this.expandedId = this.expandedId === id ? undefined : id;
  }

  onRowClick(row: any) {
    const templateId = row[4]?.id;
    if (templateId !== undefined) {
      this.template.emit(templateId);
    }
  }
}
