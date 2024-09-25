import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStatisticsViewComponent } from './workflow-statistics-view.component';

describe('WorkflowStatisticsViewComponent', () => {
  let component: WorkflowStatisticsViewComponent;
  let fixture: ComponentFixture<WorkflowStatisticsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowStatisticsViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowStatisticsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
