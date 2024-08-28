import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowHistoryComponent } from './workflow-history.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import {
  Priority,
  WorkflowInstanceStatus,
} from 'src/app/core/models/workflowinstance.model';
import { of } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';

const mockData: IPage<any> = {
  content: [
    {
      status: WorkflowInstanceStatus.FAILED,
      id: 0,
      workflowId: 0,
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
    },
  ],
  totalElements: 1,
  size: 1,
  number: 0,
  totalPages: 1,
  numberOfElements: 1,
};

describe('WorkflowHistoryComponent', () => {
  let component: WorkflowHistoryComponent;
  let fixture: ComponentFixture<WorkflowHistoryComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let router: Router;
  let cdRef: ChangeDetectorRef;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getInstancesByStatus',
      'getPausedProperty',
      'updateWorkflowInstanceStatus',
      'getWorkflowInstances',
    ]);

    apiServiceSpy.getWorkflowInstances.and.returnValue(of(mockData));

    await TestBed.configureTestingModule({
      imports: [
        WorkflowHistoryComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        // ApiService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '123' } },
            getCurrentNavigation: () => ({
              extras: { state: { name: 'Test Workflow' } },
            }),
          },
        },
        { provide: ApiService, useValue: apiServiceSpy },
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: jasmine.createSpy('markForCheck') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowHistoryComponent);
    component = fixture.componentInstance;
    // apiServiceS = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    cdRef = TestBed.inject(ChangeDetectorRef);
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

  it('should call getPageItems on ngOnInit', () => {
    spyOn(component, 'getPageItems');
    component.ngOnInit();
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should complete destroyed$ on ngOnDestroy', () => {
    spyOn(component['destroyed$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  });

  it('should update pageParams and call getPageItems on onPage', () => {
    spyOn(component, 'getPageItems');
    component.onPage(2);
    expect(component['pageParams'].page).toBe(1);
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should navigate to /workflows on backToWorkflows', () => {
    spyOn(router, 'navigate');
    component.backToWorkflows();
    expect(router.navigate).toHaveBeenCalledWith(['/workflows']);
  });

  it('should update pageParams and call getPageItems on sortColumn', () => {
    spyOn(component, 'getPageItems');
    component.sortColumn({ sortBy: 'Queued On', order: 'desc' });
    expect(component['pageParams'].sortBy).toBe('created');
    expect(component['pageParams'].order).toBe('desc');
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should navigate to workflow instance details on viewInstanceDetails', () => {
    spyOn(router, 'navigate');
    component.viewInstanceDetails({ id: '456' });
    expect(router.navigate).toHaveBeenCalledWith(['/workflowinstance', '456']);
  });

  it('should correctly count workflow instances based on their status', () => {
    component.workflowsInstances = [
      {
        status: WorkflowInstanceStatus.FAILED,
        id: 0,
        workflowId: 0,
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
      },
      {
        status: WorkflowInstanceStatus.RUNNING,
        id: 0,
        workflowId: 0,
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
      },
      {
        status: WorkflowInstanceStatus.COMPLETED,
        id: 0,
        workflowId: 0,
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
      },
    ];

    component.failedInstancesCount = 0;
    component.deliveredInstancesCount = 0;
    component.totalInstancesCount = 0;

    component.updateWorkflowsData();

    expect(component.failedInstancesCount).toBe(1);
    expect(component.deliveredInstancesCount).toBe(2);
    expect(component.totalInstancesCount).toBe(3);
  });

  it('should reset the workflow instance counts to zero', () => {
    component.failedInstancesCount = 5;
    component.deliveredInstancesCount = 10;
    component.totalInstancesCount = 15;

    component.reset();

    expect(component.failedInstancesCount).toBe(0);
    expect(component.deliveredInstancesCount).toBe(0);
    expect(component.totalInstancesCount).toBe(0);
  });
});
