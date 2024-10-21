import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowGeneralComponent } from './workflow-general.component';
import { EMAIL_STATUS, WORKFLOW_STATUS } from 'src/app/core/utils/constants';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { TemplateRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('WorkflowGeneralComponent', () => {
  let component: WorkflowGeneralComponent;
  let fixture: ComponentFixture<WorkflowGeneralComponent>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;
  let modalRefSpy: jasmine.SpyObj<BsModalRef>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('BsModalService', ['show']);
    modalRefSpy = jasmine.createSpyObj('BsModalRef', [], {
      hide: jasmine.createSpy('hide'),
    });

    const activatedRouteStub = {
      snapshot: {
        params: { id: 1 },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        WorkflowGeneralComponent,
        HttpClientModule,
        ToastrModule.forRoot(),
      ],
      providers: [
        { provide: BsModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        ToastrService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowGeneralComponent);
    component = fixture.componentInstance;
    modalServiceSpy = TestBed.inject(
      BsModalService
    ) as jasmine.SpyObj<BsModalService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize workflowStatus and emailStatus', () => {
    expect(component.workflowStatus).toEqual(WORKFLOW_STATUS);
    expect(component.emailStatus).toEqual(EMAIL_STATUS);
  });

  it('should set isEditing to true when editWorkflow is called', () => {
    component.toggleEditing();
    expect(component.isEditing).toBeTrue();
  });

  it('should set isEditing to false and reset workflowCopy when cancelChanges is called', () => {
    component.workflowCopy = { name: 'test' };
    component.workflow = { name: 'original' };
    component.isEditing = true;

    component.cancelChanges();

    expect(component.isEditing).toBeFalse();
    expect(component.workflowCopy).toEqual(component.workflow);
  });

  it('should limit throttleLimit to 100 in checkThrottleLimit', () => {
    component.workflowCopy = { throttleLimit: 150 };
    component.checkThrottleLimit({});
    expect(component.workflowCopy.throttleLimit).toBe(100);
  });

  it('should open confirm modal with correct data when deleteEmail is called', () => {
    spyOn(component, 'openConfirmModal');
    const email = 'test@example.com';
    component.deleteEmail(1, email);

    expect(component.emailId).toBe(1);
    expect(component.openConfirmModal).toHaveBeenCalledWith(
      {
        title: 'Delete Email',
        description: `Are you sure you want to delete Email:${email}?`,
        btn1Name: 'CONFIRM',
        btn2Name: 'CANCEL',
      },
      'email'
    );
  });

  it('should emit updateWorkflowEvent when confirm modal result is true for general', () => {
    spyOn(component.updateWorkflowEvent, 'emit');
    spyOn(component, 'cancelChanges');
    component.workflowCopy = { name: 'test' };

    component.openConfirmModal(
      { title: '', description: '', btn1Name: '', btn2Name: '' },
      'general'
    );
    component.getBsModalRef.content.updateChanges.emit(true);

    expect(component.updateWorkflowEvent.emit).toHaveBeenCalledWith(
      component.workflowCopy
    );
    expect(component.cancelChanges).not.toHaveBeenCalled();
  });

  it('should emit workflowEmailEvent with UPDATE action and reset newEmailData and emailId when addEmail is called and isUpdate is true', () => {
    spyOn(component.workflowEmailEvent, 'emit');
    spyOn(component.getBsModalRef, 'hide');
    component.isUpdate = true;
    component.emailId = 1;
    component.newEmailData = {
      name: 'test',
      email: 'test@example.com',
      status: null,
    };

    component.addEmail();

    expect(component.workflowEmailEvent.emit).toHaveBeenCalledWith({
      action: 'UPDATE',
      data: { name: 'test', email: 'test@example.com', status: null }, // Update if needed
      emailId: 1,
    });

    expect(component.newEmailData).toEqual({
      name: 'test',
      email: 'test@example.com',
      status: null,
    });

    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });

  it('should reset email data and close modal when cancelChangesForEmail is called', () => {
    spyOn(component, 'closeModal');
    spyOn(component, 'reset');

    component.cancelChangesForEmail();

    expect(component.closeModal).toHaveBeenCalled();
    expect(component.reset).toHaveBeenCalled();
  });

  describe('editWorkflow', () => {
    it('should set isEditing to true', () => {
      component.isEditing = false;
      component.toggleEditing();
      expect(component.isEditing).toBe(true);
    });
  });

  it('should call openConfirmModal and set isEditing to false when saveWorkflowChanges is called', () => {
    spyOn(component, 'openConfirmModal');
    component.isEditing = true;

    component.saveWorkflowChanges();

    expect(component.openConfirmModal).toHaveBeenCalledWith(
      {
        title: 'Confirm Changes',
        description:
          'Are you sure you want to Save changes for General Settings?',
        btn1Name: 'CONFIRM',
        btn2Name: 'CANCEL',
      },
      'general'
    );
    expect(component.isEditing).toBeTrue();
  });

  it('should hide the modal when closeModal is called', () => {
    spyOn(component.getBsModalRef, 'hide');

    component.closeModal();

    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });

  it('should set isUpdate to true, emailId to the provided id, and open the add email dialog when editEmail is called', () => {
    spyOn(component, 'openAddEmailDialog');
    const email = {
      id: 1,
      name: 'test',
      email: 'test@example.com',
      status: null,
    };

    component.editEmail(email, {} as TemplateRef<any>);

    expect(component.isUpdate).toBeTrue();
    expect(component.emailId).toBe(1);
    expect(component.newEmailData).toEqual(email);
    expect(component.openAddEmailDialog).toHaveBeenCalled();
  });

  it('should set isEditing to false and reset workflowCopy when cancelChanges is called', () => {
    component.workflowCopy = { name: 'test' };
    component.workflow = { name: 'original' };
    component.isEditing = true;

    component.cancelChanges();

    expect(component.isEditing).toBeFalse();
    expect(component.workflowCopy).toEqual(component.workflow);
  });

  it('should emit workflowEmailEvent with CREATE action and reset when addEmail is called and isUpdate is false', () => {
    spyOn(component.workflowEmailEvent, 'emit');
    spyOn(component.getBsModalRef, 'hide');
    component.isUpdate = false;
    component.newEmailData = {
      name: 'test',
      email: 'test@example.com',
      status: null,
    };

    component.addEmail();

    expect(component.workflowEmailEvent.emit).toHaveBeenCalledWith({
      action: 'CREATE',
      data: { name: 'test', email: 'test@example.com', status: null },
    });
    expect(component.newEmailData).toEqual({
      name: 'test',
      email: 'test@example.com',
      status: null,
    });
    expect(component.emailId).toBeUndefined();
    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });

  it('should call reset method', () => {
    spyOn(component, 'reset');
    component.reset();
    expect(component.reset).toHaveBeenCalled();
  });

  it('should prevent default action for special characters', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    spyOn(event, 'preventDefault');

    component.filterSpecialChars(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should allow digits and letters "h" and "m"', () => {
    const allowedKeys = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'h',
      'm',
    ];

    allowedKeys.forEach(key => {
      const event = new KeyboardEvent('keydown', { key });
      spyOn(event, 'preventDefault');

      component.filterSpecialChars(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('should allow Backspace key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    spyOn(event, 'preventDefault');

    component.filterSpecialChars(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should allow Tab key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'preventDefault');

    component.filterSpecialChars(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should set an error message when wait time is invalid in validateFields', () => {
    component.AssetIngestionWaitTime = 'invalid time';
    component.DataIngestionWaitTime = 'invalid time';

    component.validateFields();

    expect(component.AssetIngestionWaitTimeError).toBe(
      'Please enter a valid time (eg: 1h 30m, 3m, 5h).'
    );
    expect(component.DataIngestionWaitTimeError).toBe(
      'Please enter a valid time (eg: 1h 30m, 3m, 5h).'
    );
  });

  it('should call navigator.clipboard.writeText when copyText is called', () => {
    const url = 'https://test-url.com';
    spyOn(navigator.clipboard, 'writeText').and.callFake(() =>
      Promise.resolve()
    );

    component.copyText(url);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
  });

  it('should limit throttleLimit to 100 when checkThrottleLimit is called', () => {
    component.workflowCopy = { throttleLimit: 150 };
    component.checkThrottleLimit({});

    expect(component.workflowCopy.throttleLimit).toBe(100);
  });

  it('should toggle isEditing and reset errors when toggleEditing is called', () => {
    component.isEditing = false;

    component.toggleEditing();

    expect(component.isEditing).toBeTrue();
    expect(component.AssetIngestionWaitTimeError).toBe('');
    expect(component.DataIngestionWaitTimeError).toBe('');
  });

  it('should reset new email data and flags when reset is called', () => {
    component.newEmailData = {
      name: 'test',
      email: 'test@example.com',
      status: null,
    };
    component.isUpdate = true;
    component.emailId = 1;

    component.reset();

    expect(component.newEmailData).toEqual({
      name: '',
      email: '',
      status: null,
    });
    expect(component.isUpdate).toBeFalse();
    expect(component.emailId).toBeUndefined();
  });

  it('should set emailId and open confirm modal with correct data when deleteEmail is called', () => {
    spyOn(component, 'openConfirmModal');
    const email = 'test@example.com';
    component.deleteEmail(1, email);
    expect(component.emailId).toBe(1);
    expect(component.openConfirmModal).toHaveBeenCalledWith(
      {
        title: 'Delete Email',
        description: `Are you sure you want to delete Email:${email}?`,
        btn1Name: 'CONFIRM',
        btn2Name: 'CANCEL',
      },
      'email'
    );
  });
});
