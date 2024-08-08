import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailsComponent } from './workflow-details.component';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

describe('WorkflowDetailsComponent', () => {
  let component: WorkflowDetailsComponent;
  let fixture: ComponentFixture<WorkflowDetailsComponent>;
  let router: Router;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WorkflowDetailsComponent,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
      providers: [ApiService],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return default page params', () => {
    const defaultParams = component.getDefaultPageParams();
    expect(defaultParams).toEqual({
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    });
  });

  it('should navigate to workflows', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.backToWorkflows();

    expect(navigateSpy).toHaveBeenCalledWith(['/workflows']);
  });

  it('should sort column', () => {
    const event = { sortBy: 'Queued On', order: 'desc' };
    spyOn(component, 'getPageItems').and.stub();

    component.sortColumn(event);
    expect(component.pageParams.sortBy).toBe('created');
    expect(component.pageParams.order).toBe('desc');
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
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

  // it('should set workflow and workflowCopy when getWorkflow is called', () => {
  //   const mockWorkflow = { id: '1', name: 'Test Workflow' };
  //   spyOn(apiService, 'getWorkflowById').and.returnValue(of(mockWorkflow));

  //   component.getWorkflow();

  //   expect(apiService.getWorkflowById).toHaveBeenCalledWith('1');
  //   expect(component.workflow).toEqual(mockWorkflow);
  //   expect(component.workflowCopy).toEqual(mockWorkflow);
  // });

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
});
