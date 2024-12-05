import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowHistoryComponent } from './workflow-history.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, formatDate } from '@angular/common';
import { RouterModule, Router, Navigation } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import {
  Priority,
  WorkflowInstanceStatus,
} from 'src/app/core/models/workflowinstance.model';
import { of, throwError } from 'rxjs';
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
      pazeSize: 20,
      sortBy: 'id',
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
    expect(router.navigate).toHaveBeenCalledWith([
      '/workflows/123/workflowinstance',
      '456',
    ]);
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
        deliveryType: '',
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
        deliveryType: '',
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
        deliveryType: '',
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

  it('should call getPageItems when searchWorkflowInstance is called with empty identifier', () => {
    spyOn(component, 'getPageItems');
    component.identifier = '';
    component.searchWorkflowInstance();
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should call getWorkflowInstances with lowercase identifier in searchWorkflowInstance', () => {
    spyOn(component['apiService'], 'getWorkflowInstances').and.returnValue(
      of(mockData)
    );
    spyOn(component['cdRef'], 'markForCheck');

    component.identifier = 'TESTID';
    component.searchWorkflowInstance();

    expect(component['apiService'].getWorkflowInstances).toHaveBeenCalledWith(
      component['pageParams'],
      component.workflowId,
      'testid'
    );
  });

  it('should reset workflow instance counts to zero when there are no instances', () => {
    component.workflowsInstances = [];
    component.updateWorkflowsData();

    expect(component.failedInstancesCount).toBe(0);
    expect(component.deliveredInstancesCount).toBe(0);
    expect(component.totalInstancesCount).toBe(0);
  });

  it('should reset all workflow instance count variables to zero', () => {
    component.failedInstancesCount = 5;
    component.deliveredInstancesCount = 10;
    component.totalInstancesCount = 15;

    component.reset();

    expect(component.failedInstancesCount).toBe(0);
    expect(component.deliveredInstancesCount).toBe(0);
    expect(component.totalInstancesCount).toBe(0);
  });

  it('should handle invalid sort column heading in sortColumn', () => {
    spyOn(component, 'getPageItems');
    component.sortColumn({ sortBy: 'Invalid Heading', order: 'asc' });
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should reset all counts to zero in reset method', () => {
    component.failedInstancesCount = 5;
    component.deliveredInstancesCount = 10;
    component.totalInstancesCount = 15;

    component.reset();

    expect(component.failedInstancesCount).toBe(0);
    expect(component.deliveredInstancesCount).toBe(0);
    expect(component.totalInstancesCount).toBe(0);
  });

  it('should update pageParams and call getPageItems on onPage', () => {
    spyOn(component, 'getPageItems');
    component.onPage(3);

    expect(component['pageParams'].page).toBe(2);
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should format a valid date in formatDateForApi', () => {
    const date = new Date('2023-01-01T12:00:00');
    const formattedDate = component.formatDateForApi(date);
    expect(formattedDate).toBe('2023-01-01 12:00:00.000');
  });

  it('should return null for a null date in formatDateForApi', () => {
    const formattedDate = component.formatDateForApi(null);
    expect(formattedDate).toBeNull();
  });

  it('should format filter dates correctly in formatFilterDates', () => {
    component.filter.startDate = null;
    component.filter.completedDate = null;
    spyOn(component, 'formatDateForApi').and.callThrough();
    component.formatFilterDates();
    expect(component.filter.startDate).toBe(null);
    expect(component.filter.completedDate).toBe(null);
  });

  it('should apply filters and get page items on applyFilters', () => {
    spyOn(component, 'formatFilterDates').and.callThrough();
    spyOn(component, 'getPageItems');

    component.applyFilters();

    expect(component.formatFilterDates).toHaveBeenCalled();
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
    expect(component.showFilters).toBeFalse();
  });

  it('should return formatted date string for valid date in formatDateForApi', () => {
    const date = new Date('2023-01-01T12:00:00');
    const formattedDate = component.formatDateForApi(date);

    expect(formattedDate).toBe('2023-01-01 12:00:00.000');
  });

  it('should return null for a null date in formatDateForApi', () => {
    const formattedDate = component.formatDateForApi(null);
    expect(formattedDate).toBeNull();
  });

  it('should clear the completed date range', () => {
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
      start: new Date('2024-01-01'),
      completedDate: new Date('2024-02-01'),
      deliveryType: ['standard'],
      status: ['completed'],
      priority: ['high'],
      duration: 120,
      identifier: ['12345'],
    };

    component.clearCompletedDatesRange();
    expect(component.filter.start).toBeNull();
    expect(component.filter.completedDate).toBeNull();
  });

  it('should clear the startDate and endDate when clearDates is called', () => {
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
      start: null,
      completedDate: null,
      deliveryType: ['standard'],
      status: ['completed'],
      priority: ['high'],
      duration: 120,
      identifier: ['12345'],
    };

    component.clearDates();
    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
  });

  it('should return null when the date is null', () => {
    const result = component.formatDateForApi(null);
    expect(result).toBeNull();
  });

  it('should return formatted date string when the date is a valid Date object', () => {
    const date = new Date('2024-12-02T15:30:00.000Z');
    const expectedFormattedDate = formatDate(
      date,
      'yyyy-MM-dd HH:mm:ss.SSS',
      'en-US'
    );

    const result = component.formatDateForApi(date);
    expect(result).toBe(expectedFormattedDate);
  });

  it('should format startDate, endDate, start, and completedDate when they are defined', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-02-01');
    const start = new Date('2024-03-01');
    const completedDate = new Date('2024-04-01');

    component.filter = {
      startDate: startDate,
      endDate: endDate,
      start: start,
      completedDate: completedDate,
      deliveryType: ['standard'],
      status: ['completed'],
      priority: ['high'],
      duration: 120,
      identifier: ['12345'],
    };
    spyOn(component, 'formatDateForApi').and.callThrough();
    component.formatFilterDates();

    expect(component.formatDateForApi).toHaveBeenCalledWith(startDate);
    expect(component.formatDateForApi).toHaveBeenCalledWith(endDate);
    expect(component.formatDateForApi).toHaveBeenCalledWith(start);
    expect(component.formatDateForApi).toHaveBeenCalledWith(completedDate);

    expect(component.filter.startDate).toBe(
      component.formatDateForApi(startDate)
    );
    expect(component.filter.endDate).toBe(component.formatDateForApi(endDate));
    expect(component.filter.start).toBe(component.formatDateForApi(start));
    expect(component.filter.completedDate).toBe(
      component.formatDateForApi(completedDate)
    );
  });

  it('should not modify properties if they are null or undefined', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: new Date('2024-03-01'),
      completedDate: null,
      deliveryType: ['standard'],
      status: ['completed'],
      priority: ['high'],
      duration: 120,
      identifier: ['12345'],
    };

    spyOn(component, 'formatDateForApi').and.callThrough();

    component.formatFilterDates();

    expect(component.formatDateForApi).not.toHaveBeenCalledWith(null);

    expect(component.filter.start).toBe(
      component.formatDateForApi(new Date('2024-03-01'))
    );

    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
    expect(component.filter.completedDate).toBeNull();
  });

  it('should reset all filter properties to their default values when resetFilters is called', () => {
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
      start: new Date('2024-03-01'),
      completedDate: new Date('2024-04-01'),
      deliveryType: ['standard'],
      status: ['completed'],
      priority: ['high'],
      duration: 120,
      identifier: ['12345'],
    };
    component.resetFilters();
    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
    expect(component.filter.start).toBeNull();
    expect(component.filter.completedDate).toBeNull();
    expect(component.filter.deliveryType).toEqual([]);
    expect(component.filter.status).toEqual([]);
    expect(component.filter.priority).toEqual([]);
    expect(component.filter.duration).toBe(0);
    expect(component.filter.identifier).toEqual([]);
  });

  it('should clear identifier array and identifierInput when clearAllIdentifiers is called', () => {
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
      start: new Date('2024-03-01'),
      completedDate: new Date('2024-04-01'),
      deliveryType: ['standard'],
      status: ['completed'],
      priority: ['high'],
      duration: 120,
      identifier: ['12345'],
    };
    component.identifierInput = 'Some input value';
    component.clearAllIdentifiers();
    expect(component.filter.identifier).toEqual([]);
    expect(component.identifierInput).toBe('');
  });

  it('should reset completedDate and start to null when key is "completedDate"', () => {
    component.filter = {
      start: new Date('2024-01-01'),
      completedDate: new Date('2024-02-01'),
      startDate: null,
      endDate: null,
      priority: [],
      deliveryType: [],
      status: [],
      identifier: [],
      duration: 0,
    };
    component.clearFilter('completedDate');
    expect(component.filter.start).toBeNull();
    expect(component.filter.completedDate).toBeNull();
  });

  it('should reset startDate and endDate to null when key is "startDate"', () => {
    component.filter = {
      start: null,
      completedDate: null,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
      priority: [],
      deliveryType: [],
      status: [],
      identifier: [],
      duration: 0,
    };

    component.clearFilter('startDate');
    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
  });

  it('should shift the first element in priority, deliveryType, status, or identifier arrays', () => {
    component.filter = {
      start: null,
      completedDate: null,
      startDate: null,
      endDate: null,
      priority: ['high', 'low'],
      deliveryType: ['standard', 'express'],
      status: ['completed', 'pending'],
      identifier: ['id1', 'id2'],
      duration: 0,
    };

    component.clearFilter('priority');
    component.clearFilter('deliveryType');
    component.clearFilter('status');
    component.clearFilter('identifier');

    expect(component.filter.priority).toEqual(['low']);
    expect(component.filter.deliveryType).toEqual(['express']);
    expect(component.filter.status).toEqual(['pending']);
    expect(component.filter.identifier).toEqual(['id2']);
  });

  it('should set duration to 0 when key is "duration"', () => {
    component.filter = {
      start: null,
      completedDate: null,
      startDate: null,
      endDate: null,
      priority: [],
      deliveryType: [],
      status: [],
      identifier: [],
      duration: 120,
    };

    component.clearFilter('duration');

    expect(component.filter.duration).toBe(0);
  });

  it('should update filtersApplied after clearing a filter', () => {
    spyOn(component, 'hasActiveFilters').and.returnValue(true);

    component.clearFilter('completedDate');

    expect(component.filtersApplied).toBe(true);
    expect(component.hasActiveFilters).toHaveBeenCalled();
  });

  it('should return applied filters for startDate and endDate when both are present', () => {
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'startDate',
        label: 'Created Date',
        value: ['2024-01-01 - 2024-01-31'],
      },
    ]);
  });

  it('should return applied filters for startDate when only startDate is present', () => {
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: [],
    };
    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'startDate',
        label: 'Created Date',
        value: ['2024-01-01'],
      },
    ]);
  });

  it('should return applied filters for completedDate when both start and completedDate are present', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: new Date('2024-01-01'),
      completedDate: new Date('2024-01-31'),
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'completedDate',
        label: 'Completed Date',
        value: ['2024-01-01 - 2024-01-31'],
      },
    ]);
  });

  it('should return applied filters for completedDate when only start is present', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: new Date('2024-01-01'),
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'completedDate',
        label: 'Completed Date',
        value: ['2024-01-01'],
      },
    ]);
  });

  it('should return applied filters for duration when duration is greater than 0', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 120,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'duration',
        label: 'Duration',
        value: ['120 min'],
      },
    ]);
  });

  it('should return applied filters for status when status array is populated', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: ['completed'],
      priority: [],
      deliveryType: [],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'status',
        label: 'Status',
        value: ['completed'],
      },
    ]);
  });

  it('should return applied filters for priority when priority array is populated', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: ['high'],
      deliveryType: [],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'priority',
        label: 'Priority',
        value: ['high'],
      },
    ]);
  });

  it('should return applied filters for deliveryType when deliveryType array is populated', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: ['express'],
      identifier: [],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'deliveryType',
        label: 'Delivery Type',
        value: ['express'],
      },
    ]);
  });

  it('should return applied filters for identifier when identifier array is populated', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: ['id1'],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'identifier',
        label: 'Identifier',
        value: ['id1'],
      },
    ]);
  });

  it('should return all applicable filters when multiple filters are applied', () => {
    //  Set multiple filters in the filter object
    component.filter = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      start: new Date('2024-01-01'),
      completedDate: new Date('2024-01-31'),
      duration: 120,
      status: ['completed'],
      priority: ['high'],
      deliveryType: ['express'],
      identifier: ['id1'],
    };

    const appliedFilters = component.getAppliedFilters();

    expect(appliedFilters).toEqual([
      {
        key: 'startDate',
        label: 'Created Date',
        value: ['2024-01-01 - 2024-01-31'],
      },
      {
        key: 'completedDate',
        label: 'Completed Date',
        value: ['2024-01-01 - 2024-01-31'],
      },
      {
        key: 'duration',
        label: 'Duration',
        value: ['120 min'],
      },
      {
        key: 'status',
        label: 'Status',
        value: ['completed'],
      },
      {
        key: 'priority',
        label: 'Priority',
        value: ['high'],
      },
      {
        key: 'deliveryType',
        label: 'Delivery Type',
        value: ['express'],
      },
      {
        key: 'identifier',
        label: 'Identifier',
        value: ['id1'],
      },
    ]);
  });

  it('should remove identifier from filter.identifier array when removeIdentifier is called', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: ['id1', 'id2', 'id3'],
    };

    component.removeIdentifier(1);

    expect(component.filter.identifier).toEqual(['id1', 'id3']);
  });

  it('should add identifiers to the filter.identifier array when addIdentifier is called', () => {
    component.filter = {
      startDate: null,
      endDate: null,
      start: null,
      completedDate: null,
      duration: 0,
      status: [],
      priority: [],
      deliveryType: [],
      identifier: ['id1', 'id2', 'id3'],
    };
    component.identifierInput = 'id1, id2, id3';

    component.addIdentifier();

    expect(component.filter.identifier).toEqual(['id1', 'id2', 'id3']);
    expect(component.identifierInput).toBe('');
  });

  it('should return correct label for selected filter', () => {
    component.selectedFilter = 'startDate';
    expect(component.getSelectedFilterLabel()).toBe('Created Date');

    // Test for 'completedDate'
    component.selectedFilter = 'completedDate';
    expect(component.getSelectedFilterLabel()).toBe('Completed Date');

    // Test for 'duration'
    component.selectedFilter = 'duration';
    expect(component.getSelectedFilterLabel()).toBe('Duration');

    // Test for 'status'
    component.selectedFilter = 'status';
    expect(component.getSelectedFilterLabel()).toBe('Status');

    // Test for 'priority'
    component.selectedFilter = 'priority';
    expect(component.getSelectedFilterLabel()).toBe('Priority');

    // Test for 'deliveryType'
    component.selectedFilter = 'deliveryType';
    expect(component.getSelectedFilterLabel()).toBe('Delivery Type');

    // Test for 'identifier'
    component.selectedFilter = 'identifier';
    expect(component.getSelectedFilterLabel()).toBe('Identifier');

    // Test for an unknown value (default case)
    component.selectedFilter = 'unknown';
    expect(component.getSelectedFilterLabel()).toBe('');
  });

  it('should update selectedFilter when selectFilter is called', () => {
    component.selectedFilter = '';

    const filterName = 'startDate';
    component.selectFilter(filterName);

    expect(component.selectedFilter).toBe(filterName);
  });
});
