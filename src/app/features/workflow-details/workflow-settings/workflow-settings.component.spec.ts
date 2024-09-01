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

  it('should populate workflowSteps on init', () => {
    const mockSteps: IWorkflowStep[] = [
      {
        id: 1,
        workflowId: 123,
        executionOrder: 1,
        name: 'Step 1',
        type: 'DDEX',
        created: '',
        modified: '',
        workflowStepConfigurations: [],
      },
      {
        id: 2,
        workflowId: 123,
        executionOrder: 2,
        name: 'Step 2',
        type: 'DDEX',
        created: '',
        modified: '',
        workflowStepConfigurations: [],
      },
    ];

    const mockResponse = {
      content: mockSteps,
    };

    component.workflowId = '123';
    apiService.getWorkflowSteps.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(apiService.getWorkflowSteps).toHaveBeenCalledWith(
      '123',
      component.pageParams
    );
    expect(component.workflowSteps).toEqual(mockResponse.content);
  });

  it('should handle error when getWorkflowSteps fails', () => {
    const consoleSpy = spyOn(console, 'error');
    component.workflowId = '123';
    apiService.getWorkflowSteps.and.returnValue(
      throwError(() => new Error('Failed to load steps'))
    );

    component.ngOnInit();

    expect(apiService.getWorkflowSteps).toHaveBeenCalledWith(
      '123',
      component.pageParams
    );
    expect(consoleSpy).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it('should not call getWorkflowSteps if workflowId is null', () => {
    component.workflowId = null;
    fixture.detectChanges();

    expect(apiService.getWorkflowSteps).not.toHaveBeenCalled();
    expect(component.workflowSteps.length).toBe(0);
  });

  it('should return correct default page parameters', () => {
    const expectedParams = {
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    };
    expect(component.getDefaultPageParams()).toEqual(expectedParams);
  });
});
