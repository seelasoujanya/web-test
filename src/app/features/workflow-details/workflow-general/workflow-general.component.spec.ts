import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowGeneralComponent } from './workflow-general.component';
import { EMAIL_STATUS, WORKFLOW_STATUS } from 'src/app/core/utils/constants';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

describe('WorkflowGeneralComponent', () => {
  let component: WorkflowGeneralComponent;
  let fixture: ComponentFixture<WorkflowGeneralComponent>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;
  let bsModalRefStub: Partial<BsModalRef>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowGeneralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowGeneralComponent);
    component = fixture.componentInstance;

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
});
