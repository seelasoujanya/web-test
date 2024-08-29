import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStepSettingsComponent } from './workflow-step-settings.component';
import { HttpClientModule } from '@angular/common/http';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { SpinnerService } from 'src/app/core/services/spinner.service';

describe('WorkflowStepSettingsComponent', () => {
  let component: WorkflowStepSettingsComponent;
  let fixture: ComponentFixture<WorkflowStepSettingsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerService: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'updateWorkflowSteps',
    ]);
    const spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);

    await TestBed.configureTestingModule({
      imports: [WorkflowStepSettingsComponent, HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowStepSettingsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    spinnerService = TestBed.inject(
      SpinnerService
    ) as jasmine.SpyObj<SpinnerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle editing state', () => {
    component.enableEditing = false;
    component.toggleEditing();
    expect(component.enableEditing).toBeTrue();
    component.toggleEditing();
    expect(component.enableEditing).toBeFalse();
  });

  it('should return field value as string', () => {
    component.workflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [
        {
          key: 'testKey',
          value: 'testValue',
          id: 0,
          workflowStepId: 0,
          created: '',
          modified: '',
        },
      ],
    };
    expect(component.getFieldValue('testKey')).toBe('testValue');
  });

  it('should return field value as boolean', () => {
    component.workflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [
        {
          key: 'testKey',
          value: 'true',
          id: 0,
          workflowStepId: 0,
          created: '',
          modified: '',
        },
      ],
    };
    expect(component.getFieldValue('testKey', 'boolean')).toBeTrue();
  });

  it('should set field value correctly', () => {
    component.workflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.setFieldValue('testKey', 'testValue');
    expect(component.workflowStep?.workflowStepConfigurations[0].value).toBe(
      'testValue'
    );
  });

  it('should update checkbox field value', () => {
    component.workflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [
        {
          key: 'testKey',
          value: 'true',
          id: 0,
          workflowStepId: 0,
          created: '',
          modified: '',
        },
      ],
    };
    component.updateCheckboxFieldValue('testKey');
    expect(
      component.workflowStep?.workflowStepConfigurations[0].value
    ).toBeFalse();
  });

  it('should handle successful updateWorkflowStepSettings', () => {
    const updatedStep: IWorkflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    apiService.updateWorkflowSteps.and.returnValue(of(updatedStep));
    component.workflowStep = updatedStep;
    component.updateWorkflowStepSettings();
    expect(spinnerService.show).toHaveBeenCalled();
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(component.workflowStep).toEqual(updatedStep);
    // expect(component.enableEditing).toBeFalse();
  });

  it('should handle error in updateWorkflowStepSettings', () => {
    apiService.updateWorkflowSteps.and.returnValue(
      throwError(() => new Error('Update failed'))
    );
    component.workflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.updateWorkflowStepSettings();
    expect(spinnerService.show).toHaveBeenCalled();
    expect(spinnerService.hide).toHaveBeenCalled();
  });
});
