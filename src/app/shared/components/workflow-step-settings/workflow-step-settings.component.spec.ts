import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStepSettingsComponent } from './workflow-step-settings.component';

describe('WorkflowStepSettingsComponent', () => {
  let component: WorkflowStepSettingsComponent;
  let fixture: ComponentFixture<WorkflowStepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowStepSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowStepSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
