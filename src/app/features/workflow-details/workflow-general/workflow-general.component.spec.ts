import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowGeneralComponent } from './workflow-general.component';
import { EMAIL_STATUS, WORKFLOW_STATUS } from 'src/app/core/utils/constants';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { TemplateRef } from '@angular/core';

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

    await TestBed.configureTestingModule({
      imports: [WorkflowGeneralComponent],
      providers: [{ provide: BsModalService, useValue: modalServiceSpy }],
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
        description: `Are you sure you want to delete Email:${email} ?`,
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

  it('should emit workflowEmailEvent with DELETE action when confirm modal result is true for email', () => {
    spyOn(component.workflowEmailEvent, 'emit');
    spyOn(component, 'cancelChanges');
    component.emailId = 1;

    component.openConfirmModal(
      { title: '', description: '', btn1Name: '', btn2Name: '' },
      'email'
    );
    component.getBsModalRef.content.updateChanges.emit(true);

    expect(component.workflowEmailEvent.emit).toHaveBeenCalledWith({
      emailId: component.emailId,
      action: 'DELETE',
    });
    expect(component.cancelChanges).not.toHaveBeenCalled();
  });

  it('should reset isEditing and call cancelChanges when confirm modal result is false', () => {
    spyOn(component, 'cancelChanges');
    component.isEditing = true;

    component.openConfirmModal(
      { title: '', description: '', btn1Name: '', btn2Name: '' },
      'general'
    );
    component.getBsModalRef.content.updateChanges.emit(false);

    expect(component.isEditing).toBeTrue();
    expect(component.cancelChanges).toHaveBeenCalled();
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
      name: '',
      email: '',
      status: null,
    });
    expect(component.emailId).toBeUndefined();
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
        description: 'Are you sure you want to Save changes  for Workflow?',
        btn1Name: 'CONFIRM',
        btn2Name: 'CANCEL',
      },
      'general'
    );
    expect(component.isEditing).toBeFalse();
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
      name: '',
      email: '',
      status: null,
    });
    expect(component.emailId).toBeUndefined();
    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });
});
