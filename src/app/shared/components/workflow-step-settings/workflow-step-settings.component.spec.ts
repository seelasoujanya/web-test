import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowStepSettingsComponent } from './workflow-step-settings.component';
import { HttpClientModule } from '@angular/common/http';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

describe('WorkflowStepSettingsComponent', () => {
  let component: WorkflowStepSettingsComponent;
  let fixture: ComponentFixture<WorkflowStepSettingsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerService: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'updateWorkflowSteps',
      'updateWorkflowStepConfigs',
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
    expect(component.workflowStep?.workflowStepConfigurations[0].value).toBe(
      'false'
    );
  });

  it('should return false if no config is found for a boolean field', () => {
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
    expect(component.getFieldValue('nonExistentKey', 'boolean')).toBeFalse();
  });

  it('should return an empty string if no config is found for a string field', () => {
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
    expect(component.getFieldValue('nonExistentKey')).toBe('');
  });

  it('should add a new configuration with boolean true if key is not found in updateCheckboxFieldValue', () => {
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
    component.updateCheckboxFieldValue('newCheckboxKey');
    expect(component.workflowStep?.workflowStepConfigurations.length).toBe(1);
    expect(component.workflowStep?.workflowStepConfigurations[0].key).toBe(
      'newCheckboxKey'
    );
    expect(
      component.workflowStep?.workflowStepConfigurations[0].value
    ).toBeTrue();
  });

  it('should call openConfirmModal when saveWorkflowSettingsChanges is invoked', () => {
    const modalData = {
      title: 'Confirm Changes',
      description:
        'Are you sure you want to Save changes  for Step 1 Settings?',
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };

    spyOn(component, 'openConfirmModal');

    component.saveWorkflowSettingsChanges('Step 1');

    expect(component.openConfirmModal).toHaveBeenCalledWith(modalData);
  });

  it('should update the field value if configuration exists', () => {
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
          value: 'oldValue',
          id: 0,
          workflowStepId: 0,
          created: '',
          modified: '',
        },
      ],
    };

    component.setFieldValue('testKey', 'newValue');

    expect(component.workflowStep?.workflowStepConfigurations[0].value).toBe(
      'newValue'
    );
  });

  it('should add a new configuration if key does not exist', () => {
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

    component.setFieldValue('newKey', 'newValue');

    expect(component.workflowStep?.workflowStepConfigurations.length).toBe(1);
    expect(component.workflowStep?.workflowStepConfigurations[0].key).toBe(
      'newKey'
    );
    expect(component.workflowStep?.workflowStepConfigurations[0].value).toBe(
      'newValue'
    );
  });

  it('should update workflow step settings successfully', () => {
    const mockWorkflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-02T00:00:00Z',
      workflowStepConfigurations: [],
    };
    apiService.updateWorkflowStepConfigs.and.returnValue(of(mockWorkflowStep));

    component.workflowStep = mockWorkflowStep;
    component.updateWorkflowStepSettings();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(apiService.updateWorkflowStepConfigs).toHaveBeenCalledWith(
      1,
      component.workflowStep
    );
    expect(component.workflowStep).toEqual(mockWorkflowStep);
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(component.enableEditing).toBeFalse();
  });

  it('should handle error during workflow step settings update', () => {
    apiService.updateWorkflowStepConfigs.and.returnValue(
      throwError(() => new Error('Error updating'))
    );

    component.workflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-02T00:00:00Z',
      workflowStepConfigurations: [],
    };

    component.updateWorkflowStepSettings();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(apiService.updateWorkflowStepConfigs).toHaveBeenCalledWith(
      1,
      component.workflowStep
    );
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(component.enableEditing).toBeFalse();
  });

  it('should initialize workflowStep and fields on ngOnInit', () => {
    const mockWorkflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.workflowStep = mockWorkflowStep;
    component.ngOnInit();
    expect(component.originalWorkflowStep).toEqual(mockWorkflowStep);
  });

  it('should revert changes and disable editing on cancelChanges', () => {
    const originalWorkflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };

    component.originalWorkflowStep = originalWorkflowStep;
    component.workflowStep = { ...originalWorkflowStep, name: 'Changed Step' };
    component.enableEditing = true;

    component.cancelChanges();

    expect(component.workflowStep).toEqual(originalWorkflowStep);
    expect(component.enableEditing).toBeFalse();
  });

  it('should emit workflowStepChange when updateWorkflowStep is called', () => {
    spyOn(component.workflowStepChange, 'emit');
    const mockWorkflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 123,
      executionOrder: 1,
      name: 'Step 1',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };

    component.workflowStep = mockWorkflowStep;
    component.updateWorkflowStep();

    expect(component.workflowStepChange.emit).toHaveBeenCalledWith(
      mockWorkflowStep
    );
  });

  it('should open confirm modal with correct modal data', () => {
    spyOn(component['modalService'], 'show').and.callThrough();
    const modalData = {
      title: 'Confirm Changes',
      description: 'Test description',
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };

    component.openConfirmModal(modalData);

    expect(component['modalService'].show).toHaveBeenCalledWith(
      ConfirmModalComponent
    );
  });

  it('should not throw error when workflowStep is null on ngOnInit', () => {
    component.workflowStep = null;

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.originalWorkflowStep).toBeNull();
    expect(component.fields).toEqual([]);
  });

  it('should return default value when field configuration is not found', () => {
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
    expect(component.getFieldValue('nonExistingKey')).toBe('');
    expect(component.getFieldValue('nonExistingKey', 'boolean')).toBeFalse();
  });
});
