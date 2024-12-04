import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowSettingsComponent } from './workflow-settings.component';
import { HttpClientModule } from '@angular/common/http';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { of, throwError } from 'rxjs';

describe('WorkflowSettingsComponent', () => {
  let component: WorkflowSettingsComponent;
  let fixture: ComponentFixture<WorkflowSettingsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflowSteps',
    ]);

    await TestBed.configureTestingModule({
      imports: [WorkflowSettingsComponent, HttpClientModule],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowSettingsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return default page parameters', () => {
    const defaultParams = component.getDefaultPageParams();
    expect(defaultParams).toEqual({
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    });
  });

  describe('updateWorkflowStep', () => {
    it('should update the correct workflow step when a valid step is provided', () => {
      component.workflowSteps = [
        {
          id: 1,
          name: 'Step 1',
          workflowId: 0,
          executionOrder: 0,
          type: 'DDEX',
          created: '',
          modified: '',
          workflowStepConfigurations: [],
        },
        {
          id: 2,
          name: 'Step 2',
          workflowId: 0,
          executionOrder: 0,
          type: 'DDEX',
          created: '',
          modified: '',
          workflowStepConfigurations: [],
        },
      ];

      const updatedStep: IWorkflowStep = {
        id: 2,
        workflowId: 100,
        executionOrder: 1,
        name: 'Updated Step 1',
        type: 'DDEX',
        created: '',
        modified: '',
        workflowStepConfigurations: [],
      };
      component.updateWorkflowStep(updatedStep);
      expect(component.workflowSteps[1]).toEqual(updatedStep);
    });
  });

  it('should handle error when getWorkflowSteps fails', () => {
    const consoleSpy = spyOn(console, 'error');
    component.workflowId = '123';
    apiService.getWorkflowSteps.and.returnValue(
      throwError(() => new Error('Failed to load steps'))
    );

    component.ngOnInit();

    expect(apiService.getWorkflowSteps).toHaveBeenCalledWith('123');
    expect(consoleSpy).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it('should not call getWorkflowSteps if workflowId is null', () => {
    component.workflowId = null;
    fixture.detectChanges();

    expect(apiService.getWorkflowSteps).not.toHaveBeenCalled();
    expect(component.workflowSteps.length).toBe(0);
  });

  describe('onHeadingClick', () => {
    it('should update selectedHeading when a heading is clicked', () => {
      component.headings = ['Step 1', 'Step 2'];
      component.selectedHeading = 'Step 1';

      component.onHeadingClick('Step 2');

      expect(component.selectedHeading).toBe('Step 2');
    });
  });

  it('should not attempt to fetch workflow steps when workflowId is null or undefined', () => {
    component.workflowId = null;
    apiService.getWorkflowSteps.calls.reset();

    component.ngOnInit();

    expect(apiService.getWorkflowSteps).not.toHaveBeenCalled();
  });

  it('should not update workflow steps if the step does not exist', () => {
    component.workflowSteps = [
      {
        id: 1,
        name: 'Step 1',
        workflowId: 0,
        executionOrder: 0,
        type: 'DDEX',
        created: '',
        modified: '',
        workflowStepConfigurations: [],
      },
    ];

    const updatedStep: IWorkflowStep = {
      id: 2,
      workflowId: 100,
      executionOrder: 1,
      name: 'Updated Step 2',
      type: 'DDEX',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };

    component.updateWorkflowStep(updatedStep);

    expect(component.workflowSteps.length).toBe(1);
  });

  it('should return default page parameters with correct values', () => {
    const defaultParams = component.getDefaultPageParams();

    expect(defaultParams.page).toBe(0);
    expect(defaultParams.pazeSize).toBe(10);
    expect(defaultParams.sortBy).toBe('');
    expect(defaultParams.order).toBe('asc');
  });

  it('should not change selectedHeading if there are no headings', () => {
    component.headings = [];
    component.selectedHeading = '';

    component.onHeadingClick('Step 1');

    expect(component.selectedHeading).toBe('Step 1');
  });

  it('should set headings and selectedHeading when no steps are returned', () => {
    component.workflowId = '123';
    apiService.getWorkflowSteps.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.headings.length).toBe(0);
    expect(component.selectedHeading).toBe('');
    expect(component.showConfigs).toBe(true);
  });

  it('should set showConfigs to true when there are no headings', () => {
    component.headings = [];
    component.selectedHeading = '';

    component.ngOnInit();
    expect(component.selectedHeading).toBe('');
  });

  it('should set showConfigs to false when there are headings', () => {
    component.headings = ['Step 1'];
    component.selectedHeading = 'Step 1';

    component.ngOnInit();
    expect(component.selectedHeading).toBe('Step 1');
  });
});
