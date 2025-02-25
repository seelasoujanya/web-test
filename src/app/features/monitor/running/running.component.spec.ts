import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { RunningComponent } from './running.component';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeFormatService } from 'src/app/time-format.service';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { IPage } from 'src/app/core/models/page.model';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('RunningComponent', () => {
  let component: RunningComponent;
  let fixture: ComponentFixture<RunningComponent>;

  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let spinnerServiceSpy: jasmine.SpyObj<SpinnerService>;
  let timeFormatServiceSpy: jasmine.SpyObj<TimeFormatService>;
  let webSocketApiSpy: jasmine.SpyObj<WebSocketAPI>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;
  let toastrService: ToastrService;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getInstancesByStatus',
      'updateWorkflowInstance',
      'getPausedProperty',
    ]);
    spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);
    timeFormatServiceSpy = jasmine.createSpyObj(
      'TimeFormatService',
      ['formatDate'],
      { isUTC$: new Subject<boolean>() }
    );
    webSocketApiSpy = jasmine.createSpyObj('WebSocketAPI', [], {
      totalWorkflowsStatusCounts: new Subject<any>(),
    });
    modalServiceSpy = jasmine.createSpyObj('BsModalService', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        RunningComponent,
        HttpClientTestingModule,
        HttpClientModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
        { provide: TimeFormatService, useValue: timeFormatServiceSpy },
        { provide: WebSocketAPI, useValue: webSocketApiSpy },
        { provide: BsModalService, useValue: modalServiceSpy },
        BsModalRef,
        { provide: ToastrService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RunningComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle empty data from API', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 0,
      size: 0,
      number: 0,
      totalPages: 0,
      numberOfElements: 0,
    };
    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockData));

    component.updateRunningInstances(component.pageParams);

    expect(component.runningInstances).toEqual([]);
    expect(component.noRunningInstances).toBe(true);
  });

  it('should initialize and update running instances', () => {
    const mockData: IPage<any> = {
      content: [
        {
          id: 1,
          workflowName: 'Workflow 1',
          status: 'RUNNING',
          identifier: '123',
          created: new Date(),
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 1,
    };
    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockData));

    component.ngOnInit();

    expect(apiServiceSpy.getInstancesByStatus).toHaveBeenCalled();
    expect(component.runningInstances).toEqual(mockData.content);
  });

  it('should delete an instance and refresh data', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 1,
    };
    apiServiceSpy.updateWorkflowInstance.and.returnValue(of({}));
    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockData));

    component.deleteInstance(1);

    expect(apiServiceSpy.updateWorkflowInstance).toHaveBeenCalledWith(1, {
      status: 'TERMINATED',
    });
    expect(apiServiceSpy.getInstancesByStatus).toHaveBeenCalled();
  });

  it('should update priority and refresh data', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 1,
    };
    apiServiceSpy.updateWorkflowInstance.and.returnValue(of({}));
    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockData));
    component.expandedId = 1;
    component.priority = 'HIGH';

    component.updatePriority();

    expect(apiServiceSpy.updateWorkflowInstance).toHaveBeenCalledWith(1, {
      priority: 'HIGH',
    });
    expect(apiServiceSpy.getInstancesByStatus).toHaveBeenCalled();
  });

  it('should return correctly formatted table values', () => {
    component.runningInstances = [
      {
        id: 1,
        workflowName: 'Workflow A',
        status: 'RUNNING',
        identifier: 'abc123',
        started: new Date('2024-12-01T10:00:00'),
      },
      {
        id: 2,
        workflowName: 'Workflow B',
        status: 'COMPLETED',
        identifier: 'def456',
        started: new Date('2024-12-02T15:30:00'),
      },
    ];

    spyOn(component, 'formatDate').and.callFake((date: Date) => {
      const localDate = new Date(date);
      const datePart = localDate.toISOString().split('T')[0];
      const timePart = localDate.toLocaleTimeString('en-US', { hour12: false });
      return { date: datePart, time: timePart };
    });

    const expectedTableValues = [
      [
        1,
        'Workflow A',
        'RUNNING',
        'abc123',
        '2024-12-01<br /><span class="time">10:00:00 </span>',
      ],
      [
        2,
        'Workflow B',
        'COMPLETED',
        'def456',
        '2024-12-02<br /><span class="time">15:30:00 </span>',
      ],
    ];

    const result = component.getTableValues();

    expect(result).toEqual(expectedTableValues);
  });

  it('should toggle expandedId correctly', () => {
    const instanceA = { id: 1, workflowName: 'Workflow A' };
    const instanceB = { id: 2, workflowName: 'Workflow B' };

    expect(component.expandedId).toBeUndefined();

    component.expandAction(instanceA);
    expect(component.expandedId).toBe(1);

    component.expandAction(instanceA);
    expect(component.expandedId).toBeUndefined();

    component.expandAction(instanceB);
    expect(component.expandedId).toBe(2);
  });

  it('should update pageParams and call updateRunningInstances', () => {
    spyOn(component, 'updateRunningInstances');

    component.pageParams = {
      page: 0,
      pageSize: 10,
      status: 'created,desc',
    };

    component.onPage(2);

    expect(component.pageParams.page).toBe(1); // pageNumber - 1

    expect(component.updateRunningInstances).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      status: 'created,desc',
    });
  });

  it('should return default page parameters', () => {
    const defaultParams = component.getDefaultPageParams();

    expect(defaultParams).toEqual({
      page: 0,
      pageSize: 10,
      status: 'RUNNING',
    });
  });

  it('should set expandedId, retrieve selectedInstance, and open change priority dialog', () => {
    const mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    const mockInstance = [1];
    const mockPendingInstances = [
      { id: 1, priority: 'HIGH' },
      { id: 2, priority: 'LOW' },
    ];
    component.runningInstances = mockPendingInstances;

    spyOn(component, 'openChangePriorityDialog');

    component.onEditPriority(mockInstance, mockTemplateRef);

    expect(component.expandedId).toBe(1);
    expect(component.priority).toBe('HIGH');
    expect(component.openChangePriorityDialog).toHaveBeenCalledWith(
      mockTemplateRef
    );
  });

  it('should collapse the expanded instance when expandAction is called on the same instance', () => {
    const instance = { id: 1, workflowName: 'Workflow A' };

    component.expandAction(instance);
    expect(component.expandedId).toBe(1);

    component.expandAction(instance);
    expect(component.expandedId).toBeUndefined();
  });

  it('should handle empty runningInstances array in onEditPriority', () => {
    const mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    component.runningInstances = [];

    component.onEditPriority([1], mockTemplateRef);

    expect(component.expandedId).toBe(1);
  });

  it('should not update priority if expandedId is undefined', () => {
    component.expandedId = undefined;
    component.priority = 'LOW';

    component.updatePriority();

    expect(apiServiceSpy.updateWorkflowInstance).not.toHaveBeenCalled();
  });

  it('should open the confirm modal when onTerminateInstance is called', () => {
    const modalData = {
      title: 'Delete Instance',
      description: 'Are you sure you want to terminate instance with Id :1 ?',
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    spyOn(component, 'openConfirmModal');

    component.onTerminateInstance(1);

    expect(component.openConfirmModal).toHaveBeenCalledWith(modalData, 1);
  });

  it('should reset priority value', () => {
    component.priority = 'HIGH';

    component.reset();

    expect(component.priority).toBeNull();
  });

  it('should cancel changes for priority and reset value', () => {
    component.priority = 'HIGH';
    component.cancelChangesForPriority();

    expect(component.priority).toBeNull();
  });

  it('should close modal when closeModal is called', () => {
    spyOn(component['bsModalRef'], 'hide');

    component.closeModal();

    expect(component['bsModalRef'].hide).toHaveBeenCalled();
  });

  it('should update running instances when data is received from WebSocket', () => {
    const mockData: IPage<any> = {
      content: [
        {
          id: 1,
          workflowName: 'Workflow 1',
          status: 'RUNNING',
          identifier: '123',
          created: new Date(),
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 1,
    };
    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockData));

    component.updateRunningInstances(component.pageParams);

    webSocketApiSpy.totalWorkflowsStatusCounts.next({});

    expect(apiServiceSpy.getInstancesByStatus).toHaveBeenCalled();
    expect(component.runningInstances).toEqual(mockData.content);
  });

  it('should handle no running instances on ngOnInit', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 0,
      number: 0,
      numberOfElements: 0,
    };
    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockData));

    component.ngOnInit();

    expect(component.runningInstances).toEqual([]);
    expect(component.noRunningInstances).toBe(true);
  });

  it('should not open priority dialog if no valid instance is selected in onEditPriority', () => {
    const mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    const mockInstance = [999]; // Instance ID not present in runningInstances
    component.runningInstances = [{ id: 1, priority: 'HIGH' }];

    spyOn(component, 'openChangePriorityDialog');

    component.onEditPriority(mockInstance, mockTemplateRef);

    expect(component.openChangePriorityDialog).not.toHaveBeenCalled();
  });

  it('should not set expandedId if instance ID is undefined or null', () => {
    const instanceNull = { id: null };
    const instanceUndefined = { id: undefined };

    component.expandAction(instanceNull);
    expect(component.expandedId).toBeUndefined();

    component.expandAction(instanceUndefined);
    expect(component.expandedId).toBeUndefined();
  });
});
