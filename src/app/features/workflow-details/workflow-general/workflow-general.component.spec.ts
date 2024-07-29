import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowGeneralComponent } from './workflow-general.component';

describe('WorkflowGeneralComponent', () => {
  let component: WorkflowGeneralComponent;
  let fixture: ComponentFixture<WorkflowGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowGeneralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
