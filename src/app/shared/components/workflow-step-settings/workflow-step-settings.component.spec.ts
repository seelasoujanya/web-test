import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStepSettingsComponent } from './workflow-step-settings.component';
import { HttpClientModule } from '@angular/common/http';

describe('WorkflowStepSettingsComponent', () => {
  let component: WorkflowStepSettingsComponent;
  let fixture: ComponentFixture<WorkflowStepSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowStepSettingsComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowStepSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
