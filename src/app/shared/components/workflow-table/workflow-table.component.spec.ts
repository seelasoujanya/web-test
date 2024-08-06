import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTableComponent } from './workflow-table.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('WorkflowTableComponent', () => {
  let component: WorkflowTableComponent;
  let fixture: ComponentFixture<WorkflowTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowTableComponent, CommonModule, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
