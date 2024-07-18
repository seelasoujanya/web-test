import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailViewComponent } from './workflow-detail-view.component';

describe('WorkflowDetailViewComponent', () => {
  let component: WorkflowDetailViewComponent;
  let fixture: ComponentFixture<WorkflowDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowDetailViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
