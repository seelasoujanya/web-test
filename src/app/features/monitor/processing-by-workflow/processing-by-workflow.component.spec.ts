import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingByWorkflowComponent } from './processing-by-workflow.component';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { TimeFormatService } from 'src/app/time-format.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

describe('ProcessingByWorkflowComponent', () => {
  let component: ProcessingByWorkflowComponent;
  let fixture: ComponentFixture<ProcessingByWorkflowComponent>;
  let mockApiService: any;
  let mockWebSocketAPI: any;
  let mockTimeFormatService: any;
  let mockChangeDetectorRef: any;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockApiService = {
      retrieveStatusCountByWorkflow: jasmine
        .createSpy('retrieveStatusCountByWorkflow')
        .and.returnValue(
          of([
            {
              workflowName: 'Test Workflow',
              totalInstances: { runningCount: 1, pendingCount: 2 },
              completed: new Date(),
              paused: false,
              workflowId: 1,
            },
          ])
        ),
      updateWorkflow: jasmine
        .createSpy('updateWorkflow')
        .and.returnValue(of(true)),
    };

    mockWebSocketAPI = {
      statusCountByWorkflow: {
        subscribe: jasmine.createSpy('subscribe').and.callFake(callback => {
          callback([
            {
              workflowName: 'Test Workflow',
              totalInstances: { runningCount: 1, pendingCount: 2 },
              completed: new Date(),
              paused: false,
              workflowId: 1,
            },
          ]);
          return { unsubscribe: () => {} };
        }),
      },
    };

    mockTimeFormatService = {
      formatDate: jasmine
        .createSpy('formatDate')
        .and.returnValue({ date: '2024-12-01', time: '10:00:00' }),
      isUTC$: of(false),
    };

    mockChangeDetectorRef = {
      detectChanges: jasmine.createSpy('detectChanges'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProcessingByWorkflowComponent,
        HttpClientModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: WebSocketAPI, useValue: mockWebSocketAPI },
        { provide: TimeFormatService, useValue: mockTimeFormatService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        ToastrService,
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessingByWorkflowComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call retrieveStatusCountByWorkflow on initial load', () => {
    const fixedDate = new Date('2024-12-02T00:08:12Z');

    mockApiService.retrieveStatusCountByWorkflow.and.returnValue(
      of([
        {
          workflowName: 'Test Workflow',
          totalInstances: { runningCount: 1, pendingCount: 2 },
          completed: fixedDate,
          paused: false,
          workflowId: 1,
        },
      ])
    );

    component.ngOnInit();

    expect(mockApiService.retrieveStatusCountByWorkflow).toHaveBeenCalled();

    expect(component.workflows).toEqual([
      {
        workflowName: 'Test Workflow',
        totalInstances: { runningCount: 1, pendingCount: 2 },
        completed: fixedDate,
        paused: false,
        workflowId: 1,
      },
    ]);
  });

  it('should handle toggle change and update workflows on success', () => {
    spyOn(component, 'initialValues');
    const event = { id: 1, state: true };
    mockApiService.updateWorkflow.and.returnValue(of(true));

    component.handleToggleChange(event);
    expect(mockApiService.updateWorkflow).toHaveBeenCalledWith(1, {
      paused: true,
    });
    expect(component.initialValues).toHaveBeenCalled();
  });

  it('should handle toggle change and log error if update fails', () => {
    spyOn(console, 'error');
    const event = { id: 1, state: true };
    mockApiService.updateWorkflow.and.returnValue(of(false));

    component.handleToggleChange(event);
    expect(console.error).toHaveBeenCalledWith('Failed to update workflow.');
  });

  it('should format date correctly', () => {
    const date = new Date('2024-12-01T10:00:00');
    const formattedDate = component.formatDate(date);
    expect(formattedDate).toEqual({ date: '2024-12-01', time: '10:00:00' });
    expect(mockTimeFormatService.formatDate).toHaveBeenCalledWith(date);
  });

  it('should return workflow values correctly', () => {
    const expectedValues = [
      [
        'Test Workflow',
        1,
        2,
        '2024-12-01<br /><span class="time">10:00:00 </span>',
        { isPaused: false, id: 1 },
      ],
    ];
    expect(component.workflowValues).toEqual(expectedValues);
  });

  it('should update workflows when WebSocket data is received', () => {
    component.websocketSubscription =
      mockWebSocketAPI.statusCountByWorkflow.subscribe((data: any[]) => {
        component.workflows = data;
      });
    expect(component.workflows).toEqual([
      {
        workflowName: 'Test Workflow',
        totalInstances: { runningCount: 1, pendingCount: 2 },
        completed: new Date(),
        paused: false,
        workflowId: 1,
      },
    ]);
  });

  it('should navigate to the correct workflow URL based on workflowName', () => {
    const mockWorkflowName = 'Workflow A';
    const mockWorkflowId = 101;

    component.workflows = [
      { workflowName: 'Workflow A', workflowId: mockWorkflowId },
      { workflowName: 'Workflow B', workflowId: 102 },
    ];

    component.navigateToWorkflow(mockWorkflowName);

    expect(router.navigate).toHaveBeenCalledWith([
      '/workflows',
      mockWorkflowId,
    ]);
  });
});
