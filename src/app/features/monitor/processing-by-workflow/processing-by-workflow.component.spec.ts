import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingByWorkflowComponent } from './processing-by-workflow.component';

describe('ProcessingByWorkflowComponent', () => {
  let component: ProcessingByWorkflowComponent;
  let fixture: ComponentFixture<ProcessingByWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessingByWorkflowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessingByWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
