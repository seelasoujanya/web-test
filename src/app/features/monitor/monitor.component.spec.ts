import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorComponent } from './monitor.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { SystemProperty } from 'src/app/core/models/workflow.model';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerServiceSpy: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getInstancesByStatus',
      'getPausedProperty',
      'updateWorkflowInstanceStatus',
    ]);

    spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);

    const mockPage: IPage<any> = {
      content: [],
      totalElements: 0,
      size: 10,
      number: 0,
      totalPages: 1,
      numberOfElements: 0,
    };

    apiServiceSpy.getInstancesByStatus.and.returnValue(of(mockPage));

    apiServiceSpy.getPausedProperty.and.returnValue(
      of({ key: 'paused', value: 'false' })
    );

    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
    ]);

    await TestBed.configureTestingModule({
      imports: [MonitorComponent, HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    spinnerServiceSpy = TestBed.inject(
      SpinnerService
    ) as jasmine.SpyObj<SpinnerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle response from getPausedProperty correctly', () => {
    const mockProperty: SystemProperty = {
      key: 'paused',
      value: 'true',
      id: 0,
      description: null,
      created: '',
      modified: '',
    };
    apiService.getPausedProperty.and.returnValue(of(mockProperty));

    component.getPausedProperty('paused');

    expect(component.pausedProperty).toEqual(mockProperty);
  });

  it('should update instances correctly in updateInstances method', () => {
    const mockPage: IPage<any> = {
      content: [{ id: 1, name: 'Instance 1' }],
      totalElements: 5,
      size: 10,
      number: 0,
      totalPages: 1,
      numberOfElements: 1,
    };

    apiService.getInstancesByStatus.and.returnValue(of(mockPage));

    component.updateInstances(component.pageParams);

    expect(component.instances).toEqual(mockPage.content);
    expect(component.runningInstancesCount).toBe(mockPage.totalElements);
    expect(spinnerServiceSpy.show).toHaveBeenCalled();
    expect(spinnerServiceSpy.hide).toHaveBeenCalled();
  });

  it('should toggle expandedId correctly when expandAction is called', () => {
    const instance = { id: 1 };
    component.expandAction(instance);
    expect(component.expandedId).toBe(1);

    component.expandAction(instance);
    expect(component.expandedId).toBeUndefined();

    const anotherInstance = { id: 2 };
    component.expandAction(anotherInstance);
    expect(component.expandedId).toBe(2);
  });

  it('should call updateInstances with correct parameters in getRunningInstances', () => {
    spyOn(component, 'updateInstances').and.callThrough();

    component.getRunningInstances('RUNNING');

    expect(component.pageParams.status).toBe('RUNNING');
    expect(component.updateInstances).toHaveBeenCalledWith(
      component.pageParams
    );
  });

  it('should call updateWorkflowInstanceStatus in terminateInstance', () => {
    const instanceId = 123;
    apiService.updateWorkflowInstanceStatus.and.returnValue(of({}));

    component.terminateInstance(instanceId);

    expect(apiService.updateWorkflowInstanceStatus).toHaveBeenCalledWith(
      instanceId,
      'TERMINATED'
    );
  });

  it('should log error when getPausedProperty fails', () => {
    const errorResponse = { message: 'Failed to fetch property' };
    apiService.getPausedProperty.and.returnValue(throwError(errorResponse));

    component.getPausedProperty('paused');

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching  property:',
      errorResponse
    );
  });

  it('should update pageParams.status and call updateInstances in updateParams', () => {
    spyOn(component, 'updateInstances').and.callThrough();

    component.updateParams('QUEUED');

    expect(component.pageParams.status).toBe('QUEUED');
    expect(component.updateInstances).toHaveBeenCalledWith(
      component.pageParams
    );
  });

  it('should update pageParams.page and call updateInstances in onPage', () => {
    spyOn(component, 'updateInstances').and.callThrough();

    component.onPage(2);

    expect(component.pageParams.page).toBe(1);
    expect(component.updateInstances).toHaveBeenCalledWith(
      component.pageParams
    );
  });
});
