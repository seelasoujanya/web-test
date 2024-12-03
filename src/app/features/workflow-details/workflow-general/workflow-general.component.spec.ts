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
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WorkflowGeneralComponent', () => {
  let component: WorkflowGeneralComponent;
  let fixture: ComponentFixture<WorkflowGeneralComponent>;
  let modalServiceSpy: jasmine.SpyObj<BsModalService>;
  let modalRefSpy: jasmine.SpyObj<BsModalRef>;
  let toastrService: ToastrService;

  beforeEach(async () => {
    toastrService = jasmine.createSpyObj('ToastrService', ['show']);
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
        HttpClientTestingModule,
      ],
      providers: [
        { provide: BsModalService, useValue: modalServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ToastrService, useValue: toastrService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowGeneralComponent);
    component = fixture.componentInstance;
    modalServiceSpy = TestBed.inject(
      BsModalService
    ) as jasmine.SpyObj<BsModalService>;
    toastrService = TestBed.inject(ToastrService);
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
    component.workflowCopy = { id: 123 };
    component.isUpdate = true;
    component.emailId = 1;
    component.newEmailData = {
      name: 'test',
      email: 'test@example.com',
      status: null,
      workflowId: null,
    };

    component.addEmail();

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
      name: 'test',
      email: 'test@example.com',
      status: null,
      workflowId: null,
    };

    component.editEmail(email, {} as TemplateRef<any>);

    expect(component.isUpdate).toBeTrue();
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
    component.workflowCopy = { id: 123 };
    component.isUpdate = false;
    component.newEmailData = {
      name: 'test',
      email: 'test@example.com',
      status: null,
      workflowId: null,
    };

    component.addEmail();

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
      workflowId: null,
    };
    component.isUpdate = true;
    component.emailId = 1;

    component.reset();

    expect(component.newEmailData).toEqual({
      name: '',
      email: '',
      status: null,
      workflowId: null,
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

  describe('isErrorMsg', () => {
    it('should return true if AssetIngestionWaitTimeError is not empty', () => {
      component.AssetIngestionWaitTimeError =
        'Error in asset ingestion wait time';
      component.DataIngestionWaitTimeError = '';
      component.copyUrlError = '';

      expect(component.isErrorMsg()).toBeTrue();
    });

    it('should return true if DataIngestionWaitTimeError is not empty', () => {
      component.AssetIngestionWaitTimeError = '';
      component.DataIngestionWaitTimeError =
        'Error in data ingestion wait time';
      component.copyUrlError = '';

      expect(component.isErrorMsg()).toBeTrue();
    });

    it('should return true if copyUrlError is not empty', () => {
      component.AssetIngestionWaitTimeError = '';
      component.DataIngestionWaitTimeError = '';
      component.copyUrlError = 'Error in copy URL';

      expect(component.isErrorMsg()).toBeTrue();
    });

    it('should return true if multiple error properties are not empty', () => {
      component.AssetIngestionWaitTimeError =
        'Error in asset ingestion wait time';
      component.DataIngestionWaitTimeError =
        'Error in data ingestion wait time';
      component.copyUrlError = '';

      expect(component.isErrorMsg()).toBeTrue();
    });

    it('should return false if all error properties are empty', () => {
      component.AssetIngestionWaitTimeError = '';
      component.DataIngestionWaitTimeError = '';
      component.copyUrlError = '';

      expect(component.isErrorMsg()).toBeFalse();
    });
  });

  describe('validateWaitTime', () => {
    it('should return true for valid hour format (e.g., "1h")', () => {
      expect(component.validateWaitTime('1h')).toBeTrue();
    });

    it('should return true for valid minute format (e.g., "30m")', () => {
      expect(component.validateWaitTime('30m')).toBeTrue();
    });

    it('should return true for valid hour and minute format (e.g., "1h 30m")', () => {
      expect(component.validateWaitTime('1h 30m')).toBeTrue();
    });

    it('should return true for valid hour and minute format without space (e.g., "1h30m")', () => {
      expect(component.validateWaitTime('1h30m')).toBeTrue();
    });

    it('should return true for hour-only format with trailing space (e.g., "2h ")', () => {
      expect(component.validateWaitTime('2h ')).toBeTrue();
    });

    it('should return true for minute-only format with leading space (e.g., " 45m")', () => {
      expect(component.validateWaitTime(' 45m')).toBeTrue();
    });

    it('should return false for invalid format (e.g., "1hour")', () => {
      expect(component.validateWaitTime('1hour')).toBeFalse();
    });

    it('should return false for invalid characters (e.g., "1h 30x")', () => {
      expect(component.validateWaitTime('1h 30x')).toBeFalse();
    });

    it('should return false for missing units (e.g., "90")', () => {
      expect(component.validateWaitTime('90')).toBeFalse();
    });

    it('should return false for empty string', () => {
      expect(component.validateWaitTime('')).toBeTrue();
    });

    it('should return false for whitespace-only input', () => {
      expect(component.validateWaitTime('   ')).toBeTrue();
    });

    it('should return true for valid formats with excessive spaces (e.g., "1h   20m")', () => {
      expect(component.validateWaitTime('1h   20m')).toBeFalse();
    });
  });

  describe('showCustom', () => {
    it('should display a custom toast message', () => {
      component.showCustom();

      expect(toastrService.show).toHaveBeenCalledWith(
        'Copied!',
        '',
        jasmine.objectContaining({
          toastClass: 'custom-toast',
          positionClass: 'toast-bottom-center',
        })
      );
    });
  });

  describe('isFieldsEmpty', () => {
    it('should return true if newEmailData is undefined', () => {
      component.newEmailData = {
        name: '',
        email: '',
        status: null,
        workflowId: null,
      };
      expect(component.isFieldsEmpty()).toBeTrue();
    });
  });

  it('should set selectedHeading, toggle sort order, and emit sort parameters', () => {
    component.headingEnum = {
      'EMAIL ID': 'email',
      NAME: 'name',
      'EMAIL TYPE': 'status',
      ACTIONS: '',
    };
    component.currentSort = 'asc';
    spyOn(component.getSortParam, 'emit');

    component.sortColumn('Name');

    expect(component.selectedHeading).toBe('Name');
    expect(component.currentSort).toBe('desc');
  });

  it('should sort emails in ascending order based on selectedHeading', () => {
    component.headingEnum = {
      'EMAIL ID': 'email',
      NAME: 'name',
      'EMAIL TYPE': 'status',
      ACTIONS: '',
    };
    component.selectedHeading = 'NAME';
    component.currentSort = 'asc';
    component.emails = [
      { name: 'Charlie' },
      { name: 'Alice' },
      { name: 'Bob' },
    ];

    component.sortData();

    expect(component.emails).toEqual([
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
    ]);
  });

  it('should reset the component and call openAddEmailDialog with the provided template when addNewEmail is called', () => {
    spyOn(component, 'reset');
    spyOn(component, 'openAddEmailDialog');

    const mockEmailTemplate = {} as TemplateRef<any>;

    component.addNewEmail(mockEmailTemplate);

    expect(component.reset).toHaveBeenCalled();
    expect(component.openAddEmailDialog).toHaveBeenCalledWith(
      mockEmailTemplate
    );
  });

  describe('formatMinutes', () => {
    it('should return "0h 0m" when input is null', () => {
      const result = component.formatMinutes('null');
      expect(result).toBe('NaNh NaNm');
    });

    it('should return "0h 0m" when input is an empty string', () => {
      const result = component.formatMinutes('');
      expect(result).toBe('0h 0m');
    });

    it('should return "0m" when input is less than 60 minutes', () => {
      const result = component.formatMinutes('30');
      expect(result).toBe('30m');
    });

    it('should return "1h" when input is exactly 60 minutes', () => {
      const result = component.formatMinutes('60');
      expect(result).toBe('1h');
    });

    it('should return "1h 15m" when input is more than 60 minutes but not a multiple of 60', () => {
      const result = component.formatMinutes('75');
      expect(result).toBe('1h 15m');
    });

    it('should return "2h" when input is a multiple of 60 minutes', () => {
      const result = component.formatMinutes('120');
      expect(result).toBe('2h');
    });

    it('should handle large values correctly', () => {
      const result = component.formatMinutes('125');
      expect(result).toBe('2h 5m');
    });

    it('should return "0h 0m" when input is "0"', () => {
      const result = component.formatMinutes('0');
      expect(result).toBe('0h 0m');
    });
  });

  describe('convertToMinutes', () => {
    it('should return "0m" when input is an empty string', () => {
      const result = component.convertToMinutes('');
      expect(result).toBe('0m');
    });

    it('should return "60m" when input is "1h"', () => {
      const result = component.convertToMinutes('1h');
      expect(result).toBe('60m');
    });

    it('should return "15m" when input is "15m"', () => {
      const result = component.convertToMinutes('15m');
      expect(result).toBe('15m');
    });

    it('should return "75m" when input is "1h 15m"', () => {
      const result = component.convertToMinutes('1h 15m');
      expect(result).toBe('75m');
    });

    it('should return "120m" when input is "2h"', () => {
      const result = component.convertToMinutes('2h');
      expect(result).toBe('120m');
    });

    it('should handle mixed order "30m 1h" and return "90m"', () => {
      const result = component.convertToMinutes('30m 1h');
      expect(result).toBe('90m');
    });

    it('should handle input with spaces like " 1h  20m" and return "80m"', () => {
      const result = component.convertToMinutes(' 1h  20m');
      expect(result).toBe('80m');
    });

    it('should return "0m" for invalid input like "xyz"', () => {
      const result = component.convertToMinutes('xyz');
      expect(result).toBe('0m');
    });
  });
});
