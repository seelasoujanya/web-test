import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { WorkflowDetailsComponent } from './workflow-details.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import {
  Priority,
  WorkflowInstanceStatus,
} from 'src/app/core/models/workflowinstance.model';
import { ChangeDetectorRef } from '@angular/core';
import { IPage } from 'src/app/core/models/page.model';
import { Workflow } from 'src/app/core/models/workflow.model';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('WorkflowDetailsComponent', () => {
  let component: WorkflowDetailsComponent;
  let fixture: ComponentFixture<WorkflowDetailsComponent>;
  let router: Router;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerService: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getArtifacts',
      'getLogsForInstance',
      'downloadArtifact',
      'getWorkflowInstances',
      'getWorkflowSteps',
      'updateWorkflow',
      'getWorkflowById',
      'getEmailsByWorkflowId',
      'deleteEmailById',
    ]);

    const spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        WorkflowDetailsComponent,
        HttpClientModule,
        ToastrModule.forRoot(),
        RouterModule.forRoot([]),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          ToastrService,
          useValue: {
            queryParams: of({ tab: 'general' }),
            snapshot: { params: { id: '123' } },
          },
        },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router);
    spinnerService = TestBed.inject(
      SpinnerService
    ) as jasmine.SpyObj<SpinnerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to workflows', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.backToWorkflows();

    expect(navigateSpy).toHaveBeenCalledWith(['/workflows']);
  });

  it('should reset counts', () => {
    component.failedInstancesCount = 5;
    component.deliveredInstancesCount = 10;
    component.totalInstancesCount = 15;
    component.reset();
    expect(component.failedInstancesCount).toBe(0);
    expect(component.deliveredInstancesCount).toBe(0);
    expect(component.totalInstancesCount).toBe(0);
  });

  it('should navigate to workflow instance details', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const data = { id: 123 };
    component.viewInstanceDetails(data);
    expect(navigateSpy).toHaveBeenCalledWith(['/workflowinstance', 123]);
  });

  it('should set selectedTab when selectTab is called', () => {
    const tab = 'history';
    component.selectTab(tab);
    expect(component.selectedTab).toBe(tab);
  });

  describe('workflowEmailSettings', () => {
    beforeEach(() => {
      spyOn(component, 'addEmail');
      spyOn(component, 'updateEmail');
      spyOn(component, 'deleteEmailById');
    });

    it('should call deleteEmailById when action is DELETE', () => {
      const emailData = { action: 'DELETE', emailId: '123' };

      component.workflowEmailSettings(emailData);

      expect(component.deleteEmailById).toHaveBeenCalledWith('123');
    });

    it('should call addEmail when action is CREATE', () => {
      const emailData = {
        action: 'CREATE',
        data: { email: 'test@example.com' },
      };

      component.workflowEmailSettings(emailData);

      expect(component.addEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should call updateEmail when action is UPDATE', () => {
      const emailData = {
        action: 'UPDATE',
        emailId: '123',
        data: { email: 'test@example.com' },
      };

      component.workflowEmailSettings(emailData);

      expect(component.updateEmail).toHaveBeenCalledWith('123', {
        email: 'test@example.com',
      });
    });

    it('should not call any method when emailData is null', () => {
      component.workflowEmailSettings(null);

      expect(component.deleteEmailById).not.toHaveBeenCalled();
      expect(component.addEmail).not.toHaveBeenCalled();
      expect(component.updateEmail).not.toHaveBeenCalled();
    });

    it('should not call any method when action is not recognized', () => {
      const emailData = {
        action: 'UNKNOWN',
        emailId: '123',
        data: { email: 'test@example.com' },
      };

      component.workflowEmailSettings(emailData);

      expect(component.deleteEmailById).not.toHaveBeenCalled();
      expect(component.addEmail).not.toHaveBeenCalled();
      expect(component.updateEmail).not.toHaveBeenCalled();
    });
  });

  it('should update workflows data correctly', () => {
    component.workflowsInstances = [
      {
        status: WorkflowInstanceStatus.FAILED,
        id: 0,
        workflowId: 1,
        completed: null,
        duration: null,
        reason: null,
        triggerData: {},
        log: null,
        identifier: '',
        errorMessage: null,
        priority: Priority.LOW,
        created: new Date(),
        modified: new Date(),
        deliveryType: '',
      },
      {
        status: WorkflowInstanceStatus.RUNNING,
        id: 0,
        workflowId: 1,
        completed: null,
        duration: null,
        reason: null,
        triggerData: {},
        log: null,
        identifier: '',
        errorMessage: null,
        priority: Priority.LOW,
        created: new Date(),
        modified: new Date(),
        deliveryType: '',
      },
    ];

    component.updateWorkflowsData();

    expect(component.failedInstancesCount).toBe(1);
    expect(component.deliveredInstancesCount).toBe(1);
    expect(component.totalInstancesCount).toBe(2);
  });

  it('should call ngOnInit methods', () => {
    spyOn(component, 'getWorkflow').and.stub();
    spyOn(component, 'getEmailsByWorkflowId').and.stub();

    component.ngOnInit();

    expect(component.getWorkflow).toHaveBeenCalled();
    expect(component.getEmailsByWorkflowId).toHaveBeenCalled();
  });

  it('should handle missing workflow instances in updateWorkflowsData', () => {
    component.workflowsInstances = [];

    component.updateWorkflowsData();

    expect(component.failedInstancesCount).toBe(0);
    expect(component.deliveredInstancesCount).toBe(0);
    expect(component.totalInstancesCount).toBe(0);
  });
});
