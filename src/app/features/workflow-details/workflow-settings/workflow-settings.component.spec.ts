import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSettingsComponent } from './workflow-settings.component';
import { HttpClientModule } from '@angular/common/http';

describe('WorkflowSettingsComponent', () => {
  let component: WorkflowSettingsComponent;
  let fixture: ComponentFixture<WorkflowSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowSettingsComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
