import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingComponent } from './pending.component';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, Subject, Subscription, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeFormatService } from 'src/app/time-format.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { CommonTableComponent } from 'src/app/shared/components/common-table/common-table.component';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { TemplateRef } from '@angular/core';
import { IPage } from 'src/app/core/models/page.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('PendingComponent', () => {
  let component: PendingComponent;
  let fixture: ComponentFixture<PendingComponent>;
  let apiService: ApiService;
  let spinnerService: SpinnerService;
  let timeFormatService: TimeFormatService;
  let bsModalService: BsModalService;
  let webSocketAPI: WebSocketAPI;
  let toastrService: ToastrService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        ReactiveFormsModule,
        FormsModule,
        PaginationComponent,
        CommonTableComponent,
        HttpClientTestingModule,
      ],
      providers: [
        ApiService,
        SpinnerService,
        TimeFormatService,
        BsModalService,
        WebSocketAPI,
        ToastrService,
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    spinnerService = TestBed.inject(SpinnerService);
    timeFormatService = TestBed.inject(TimeFormatService);
    bsModalService = TestBed.inject(BsModalService);
    webSocketAPI = TestBed.inject(WebSocketAPI);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastrService = TestBed.inject(ToastrService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updatePendingInstances on ngOnInit', () => {
    spyOn(component, 'updatePendingInstances');
    component.ngOnInit();
    expect(component.updatePendingInstances).toHaveBeenCalled();
  });

  it('should subscribe to isUTC$', () => {
    const spy = spyOn(timeFormatService.isUTC$, 'subscribe').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should update pendingInstances on updatePendingInstances', () => {
    const mockData: IPage<any> = {
      content: [
        {
          id: 1,
          workflowName: 'Workflow 1',
          status: 'PENDING',
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

    spyOn(apiService, 'getInstancesByStatus').and.returnValue(of(mockData));

    component.updatePendingInstances({
      page: 0,
      pageSize: 10,
      status: 'PENDING',
    });

    expect(component.pendingInstances.length).toBe(1);
    expect(component.page).toEqual(mockData);
  });

  it('should return correct table values', () => {
    component.pendingInstances = [
      {
        id: 1,
        workflowName: 'Workflow 1',
        status: 'PENDING',
        identifier: '123',
        created: new Date(),
      },
    ];
    const values = component.getTableValues();
    expect(values.length).toBe(1);
  });

  it('should expand and collapse instance on expandAction', () => {
    const instance = { id: 1 };
    component.expandAction(instance);
    expect(component.expandedId).toBe(1);
    component.expandAction(instance);
    expect(component.expandedId).toBeUndefined();
  });

  it('should reset priority on reset', () => {
    component.priority = 'High';
    component.reset();
    expect(component.priority).toBeNull();
  });

  it('should open confirm modal on onTerminateInstance', () => {
    const mockId = 1;
    spyOn(component, 'openConfirmModal');
    component.onTerminateInstance(mockId);
    expect(component.openConfirmModal).toHaveBeenCalled();
  });

  it('should delete instance on deleteInstance', () => {
    const mockId = 1;
    spyOn(apiService, 'updateWorkflowInstance').and.returnValue(of({}));
    component.deleteInstance(mockId);
    expect(apiService.updateWorkflowInstance).toHaveBeenCalledWith(mockId, {
      status: 'TERMINATED',
    });
  });

  it('should update page on onPage', () => {
    const pageNumber = 2;
    spyOn(component, 'updatePendingInstances');
    component.onPage(pageNumber);
    expect(component.pageParams.page).toBe(pageNumber - 1);
  });

  it('should set expandedId, retrieve selectedInstance, and open change priority dialog', () => {
    const mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    const mockInstance = [1];
    const mockPendingInstances = [
      { id: 1, priority: 'HIGH' },
      { id: 2, priority: 'LOW' },
    ];
    component.pendingInstances = mockPendingInstances;

    spyOn(component, 'openChangePriorityDialog');

    component.onEditPriority(mockInstance, mockTemplateRef);

    expect(component.expandedId).toBe(1);
    expect(component.priority).toBe('HIGH');
    expect(component.openChangePriorityDialog).toHaveBeenCalledWith(
      mockTemplateRef
    );
  });

  it('should delegate to timeFormatService.formatDate', () => {
    const mockDate = new Date('2024-12-01T10:00:00');
    const formatDateSpy = spyOn(
      component['timeFormatService'],
      'formatDate'
    ).and.returnValue({ date: '01/01/2024', time: '12:00 PM' });

    const formattedDate = component.formatDate(mockDate);

    expect(formatDateSpy).toHaveBeenCalledWith(mockDate);
  });

  it('should unsubscribe from WebSocket on ngOnDestroy', () => {
    spyOn(component.destroyed$, 'next');
    spyOn(component.destroyed$, 'complete');

    component.ngOnDestroy();

    expect(component.destroyed$.next).toHaveBeenCalled();
    expect(component.destroyed$.complete).toHaveBeenCalled();
  });

  it('should return default page parameters from getDefaultPageParams', () => {
    const defaultParams = component.getDefaultPageParams();
    expect(defaultParams).toEqual({ page: 0, pageSize: 10, status: 'PENDING' });
  });

  it('should close modal on cancelChangesForPriority', () => {
    spyOn(component, 'closeModal');

    component.cancelChangesForPriority();

    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should not set expandedId if instance ID is undefined in expandAction', () => {
    const instance = { id: undefined };

    component.expandAction(instance);

    expect(component.expandedId).toBeUndefined();
  });

  it('should not open priority dialog if selected instance is not found in onEditPriority', () => {
    const mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    const mockInstance = [999];
    const mockPendingInstances = [{ id: 1, priority: 'HIGH' }];

    component.pendingInstances = mockPendingInstances;
    spyOn(component, 'openChangePriorityDialog');

    component.onEditPriority(mockInstance, mockTemplateRef);

    expect(component.openChangePriorityDialog).not.toHaveBeenCalled();
  });

  it('should return empty array when pendingInstances is empty', () => {
    component.pendingInstances = [];
    const values = component.getTableValues();
    expect(values.length).toBe(0);
  });

  it('should collapse instance if the same instance ID is expanded', () => {
    const instance = { id: 1 };
    component.expandedId = 1;
    component.expandAction(instance);
    expect(component.expandedId).toBeUndefined();
  });

  it('should not open priority dialog if selected instance is not found in onEditPriority', () => {
    const mockTemplateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    const mockInstance = [999];
    const mockPendingInstances = [{ id: 1, priority: 'HIGH' }];

    component.pendingInstances = mockPendingInstances;
    spyOn(component, 'openChangePriorityDialog');

    component.onEditPriority(mockInstance, mockTemplateRef);

    expect(component.openChangePriorityDialog).not.toHaveBeenCalled();
  });

  it('should call openConfirmModal with correct parameters in onTerminateInstance', () => {
    const mockId = 1;
    spyOn(component, 'openConfirmModal');

    component.onTerminateInstance(mockId);

    expect(component.openConfirmModal).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Delete Instance',
        description: `Are you sure you want to terminate instance with Id: ${mockId}?`,
      }),
      mockId
    );
  });

  it('should update pageParams.page correctly in onPage', () => {
    const pageNumber = 2;
    component.onPage(pageNumber);

    expect(component.pageParams.page).toBe(pageNumber - 1);
  });

  it('should reset priority to null in reset', () => {
    component.priority = 'High';
    component.reset();
    expect(component.priority).toBeNull();
  });

  it('should return empty array when pendingInstances is empty', () => {
    component.pendingInstances = [];
    const values = component.getTableValues();
    expect(values).toEqual([]);
  });

  it('should update pending instances on WebSocket data change', () => {
    const mockData = {
      totalWorkflowsStatusCounts: new Subject<any>(),
    };
    spyOn(component, 'updatePendingInstances');

    component.updateDataFromWebSocket();
    mockData.totalWorkflowsStatusCounts.next({});

    expect(component.updatePendingInstances).toHaveBeenCalledWith(
      component.pageParams
    );
  });

  it('should navigate to the correct workflow URL', () => {
    const mockInstanceId = 1;
    const mockWorkflowId = 101;

    component.pendingInstances = [
      { id: 1, workflowId: mockWorkflowId },
      { id: 2, workflowId: 102 },
    ];

    component.navigateToWorkflow(mockInstanceId);

    expect(router.navigate).toHaveBeenCalledWith([
      '/workflows',
      mockWorkflowId,
    ]);
  });

  it('should navigate to the correct workflow instance URL', () => {
    const mockInstanceId = 1;
    const mockWorkflowId = 101;

    component.pendingInstances = [
      { id: 1, workflowId: mockWorkflowId },
      { id: 2, workflowId: 102 },
    ];

    component.navigateToInstance(mockInstanceId);

    expect(router.navigate).toHaveBeenCalledWith([
      `/workflows/${mockWorkflowId}/workflowinstance`,
      mockInstanceId,
    ]);
  });
});
