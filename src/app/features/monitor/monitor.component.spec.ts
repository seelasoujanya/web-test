import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorComponent } from './monitor.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { of, Subscription, throwError } from 'rxjs';
import { IPage } from 'src/app/core/models/page.model';
import { SystemProperty } from 'src/app/core/models/workflow.model';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { WebSocketAPI } from 'src/app/core/services/websocket.service';
import { TemplateRef } from '@angular/core';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerServiceSpy: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getInstancesByStatus',
      'getPausedProperty',
      'updateWorkflowInstance',
      'updateSystemProperty',
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

    apiServiceSpy.updateWorkflowInstance.and.returnValue(of({}));

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

  it('should hide modal in closeModal', () => {
    spyOn(component.getBsModalRef, 'hide');

    component.closeModal();

    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });

  it('should reset priority changes and close modal in cancelChangesForPriority', () => {
    spyOn(component, 'closeModal');
    spyOn(component, 'reset');

    component.cancelChangesForPriority();

    expect(component.closeModal).toHaveBeenCalled();
    expect(component.reset).toHaveBeenCalled();
  });

  it('should reset priority value in reset', () => {
    component.priority = 'HIGH';

    component.reset();

    expect(component.priority).toBeNull();
  });

  it('should update priority and reset modal in updatePriority', () => {
    component.expandedId = 1;
    component.priority = 'HIGH';
    spyOn(component, 'reset');
    spyOn(component.getBsModalRef, 'hide');

    component.updatePriority();

    expect(apiService.updateWorkflowInstance).toHaveBeenCalledWith(1, {
      priority: 'HIGH',
    });
    expect(component.reset).toHaveBeenCalled();
    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });

  it('should open change priority dialog with correct configuration', () => {
    const priorityTemplate = {} as TemplateRef<any>;
    spyOn(component['modalService'], 'show').and.callThrough();

    component.openChangePriorityDialog(priorityTemplate);

    expect(component['modalService'].show).toHaveBeenCalledWith(
      priorityTemplate,
      {
        backdrop: true,
        ignoreBackdropClick: true,
        keyboard: false,
      }
    );
  });

  it('should set priority and open change priority dialog', () => {
    const instance = { priority: 'HIGH' };
    const priorityTemplate = {} as TemplateRef<any>;
    spyOn(component, 'openChangePriorityDialog').and.callThrough();

    component.editPriority(instance, priorityTemplate);

    expect(component.priority).toBe('HIGH');
    expect(component.openChangePriorityDialog).toHaveBeenCalledWith(
      priorityTemplate
    );
  });

  it('should call deleteInstance and update instances', () => {
    const instanceId = 123;

    spyOn(component, 'updateInstances').and.callThrough();

    component.deleteInstance(instanceId);

    expect(apiService.updateWorkflowInstance).toHaveBeenCalledWith(instanceId, {
      status: 'TERMINATED',
    });
    expect(component.updateInstances).toHaveBeenCalledWith(
      component.pageParams
    );
  });

  it('should open confirm modal for terminating instance', () => {
    const id = 123;
    const modalData = {
      title: 'Delete Instance',
      description: `Are you sure you want to terminate instance with Id :${id} ?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    spyOn(component, 'openConfirmModal').and.callThrough();

    component.terminateInstance(id);

    expect(component.openConfirmModal).toHaveBeenCalledWith(modalData, id);
  });

  it('should handle empty response from getPausedProperty', () => {
    apiService.getPausedProperty.and.returnValue(of(null));

    component.getPausedProperty('paused');

    expect(component.pausedProperty).toBeNull();
  });

  it('should call deleteInstance and update instances on success', () => {
    const instanceId = 123;
    spyOn(component, 'updateInstances').and.callThrough();
    component.deleteInstance(instanceId);
    expect(apiService.updateWorkflowInstance).toHaveBeenCalledWith(instanceId, {
      status: 'TERMINATED',
    });
    expect(component.updateInstances).toHaveBeenCalledWith(
      component.pageParams
    );
  });

  it('should handle error when deleteInstance fails', () => {
    const instanceId = 123;
    const errorResponse = { message: 'Error updating workflow instance' };
    apiService.updateWorkflowInstance.and.returnValue(
      throwError(errorResponse)
    );
    component.deleteInstance(instanceId);
    expect(apiService.updateWorkflowInstance).toHaveBeenCalledWith(instanceId, {
      status: 'TERMINATED',
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error updating workflow instance',
      errorResponse
    );
  });

  it('should toggle pauseAllInstances and update propertyDTO correctly when pauseInstances is called', () => {
    component.pauseAllInstances = false;
    component.pausedProperty = {
      key: 'pause',
      description: 'Pause all instances',
      id: 1,
      value: 'false',
      created: '',
      modified: '',
    };
    component.propertyDTO = { value: '', key: '', description: '' };

    const mockSystemProperty: SystemProperty = {
      key: 'pause',
      description: 'Pause all instances',
      id: 1,
      value: 'true',
      created: '',
      modified: '',
    };
    apiService.updateSystemProperty.and.returnValue(of(mockSystemProperty));
    component.pauseInstances();
    expect(component.pauseAllInstances).toBeTrue();
    expect(component.propertyDTO.value).toBe('true');
    expect(component.propertyDTO.key).toBe('pause');
    expect(component.propertyDTO.description).toBe('Pause all instances');
    expect(apiService.updateSystemProperty).toHaveBeenCalledWith(
      1,
      component.propertyDTO
    );
  });

  it('should return correct WebSocket subscription', () => {
    const subscription = new Subscription();
    spyOn(component, 'getWebSocketSubscription').and.returnValue(subscription);

    expect(component.getWebSocketSubscription()).toBe(subscription);
  });

  it('should open confirm modal with correct data', () => {
    const modalData = {
      title: 'Confirm',
      description: 'Are you sure?',
      btn1Name: 'Yes',
      btn2Name: 'No',
    };
    const id = 123;
    component.openConfirmModal(modalData, id);

    expect(component.getBsModalRef.content.title).toBe(modalData.title);
    expect(component.getBsModalRef.content.description).toBe(
      modalData.description
    );
    expect(component.getBsModalRef.content.applyButton).toBe(
      modalData.btn1Name
    );
    expect(component.getBsModalRef.content.cancelButton).toBe(
      modalData.btn2Name
    );
  });

  it('should open priority change dialog with correct configuration', () => {
    const priorityTemplate = {} as TemplateRef<any>;
    component.openChangePriorityDialog(priorityTemplate);

    expect(component.getBsModalRef).toBeDefined();
  });

  it('should handle error in updatePriority', () => {
    component.expandedId = 1;
    component.priority = 'HIGH';
    const errorResponse = { message: 'Failed to update priority' };
    apiService.updateWorkflowInstance.and.returnValue(
      throwError(errorResponse)
    );

    component.updatePriority();

    expect(console.error).toHaveBeenCalledWith(
      'Error updating priority',
      errorResponse
    );
  });
});
