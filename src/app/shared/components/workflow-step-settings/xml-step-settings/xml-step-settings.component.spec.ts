import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlStepSettingsComponent } from './xml-step-settings.component';
import { HttpClientModule } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { IWorkflowStep } from 'src/app/core/models/workflow-step';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { IPage } from 'src/app/core/models/page.model';

describe('XmlStepSettingsComponent', () => {
  let component: XmlStepSettingsComponent;
  let fixture: ComponentFixture<XmlStepSettingsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let spinnerService: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getAllTemplates',
      'getSelectedTemplate',
      'updateTemplateForStep',
      'postTemplateForStep',
    ]);
    const spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);
    await TestBed.configureTestingModule({
      imports: [XmlStepSettingsComponent, HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlStepSettingsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    spinnerService = TestBed.inject(
      SpinnerService
    ) as jasmine.SpyObj<SpinnerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call apiService.getAllTemplates and apiService.getSelectedTemplate on ngOnInit', () => {
    const workflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 1,
      executionOrder: 1,
      name: 'Test',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.workflowStep = workflowStep;

    const mockTemplates: IPage<{
      id: number;
      name: string;
      description: string;
    }> = {
      content: [{ id: 1, name: 'Template1', description: 'Description1' }],
      totalElements: 1,
      totalPages: 1,
      size: 0,
      number: 0,
      numberOfElements: 0,
    };
    apiService.getAllTemplates.and.returnValue(of(mockTemplates));
    apiService.getSelectedTemplate.and.returnValue(of([{ templateId: 1 }]));

    component.ngOnInit();

    expect(apiService.getAllTemplates).toHaveBeenCalledWith(
      component.pageParams
    );
    expect(apiService.getSelectedTemplate).toHaveBeenCalledWith(
      workflowStep.workflowId
    );
    expect(component.templates).toEqual(mockTemplates.content);
    expect(component.selectedTemplateId).toEqual(1);
  });

  it('should handle error when apiService.getAllTemplates fails', () => {
    apiService.getAllTemplates.and.returnValue(
      throwError(() => new Error('Error fetching templates'))
    );

    component.ngOnInit();

    expect(component.templates).toEqual([]);
  });

  it('should handle error when apiService.getSelectedTemplate fails', () => {
    apiService.getSelectedTemplate.and.returnValue(
      throwError(() => new Error('Error fetching selected template'))
    );

    component.ngOnInit();

    expect(component.selectedTemplateId).toBeUndefined();
  });

  it('should toggle editing mode when toggleEditing is called', () => {
    expect(component.enableEditing).toBeFalse();
    component.toggleEditing();
    expect(component.enableEditing).toBeTrue();
    component.toggleEditing();
    expect(component.enableEditing).toBeFalse();
  });

  it('should update template when updateTemplate is called with hasSelectedTemplate true', () => {
    const workflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 1,
      executionOrder: 1,
      name: 'Test',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.workflowStep = workflowStep;
    component.selectedTemplateId = 1;
    component.hasSelectedTemplate = true;

    apiService.updateTemplateForStep.and.returnValue(of({}));
    spinnerService.show.and.callThrough();
    spinnerService.hide.and.callThrough();

    component.updateTemplate();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(apiService.updateTemplateForStep).toHaveBeenCalledWith(
      workflowStep.workflowId,
      {
        workflowStepId: workflowStep.id,
        templateId: component.selectedTemplateId,
      }
    );
    expect(spinnerService.hide).toHaveBeenCalled();
  });

  it('should update template when updateTemplate is called with hasSelectedTemplate false', () => {
    const workflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 1,
      executionOrder: 1,
      name: 'Test',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.workflowStep = workflowStep;
    component.selectedTemplateId = 1;
    component.hasSelectedTemplate = false;

    apiService.postTemplateForStep.and.returnValue(of({}));
    spinnerService.show.and.callThrough();
    spinnerService.hide.and.callThrough();

    component.updateTemplate();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(apiService.postTemplateForStep).toHaveBeenCalledWith({
      workflowStepId: workflowStep.id,
      templateId: component.selectedTemplateId,
    });
    expect(spinnerService.hide).toHaveBeenCalled();
  });

  it('should handle error when updateTemplate fails', () => {
    const workflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 1,
      executionOrder: 1,
      name: 'Test',
      type: 'SFTP',
      created: '',
      workflowStepConfigurations: [],
      modified: '',
    };
    component.workflowStep = workflowStep;
    component.selectedTemplateId = 1;
    component.hasSelectedTemplate = true;

    apiService.updateTemplateForStep.and.returnValue(
      throwError(() => new Error('Error updating template'))
    );
    spinnerService.show.and.callThrough();
    spinnerService.hide.and.callThrough();

    component.updateTemplate();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(apiService.updateTemplateForStep).toHaveBeenCalledWith(
      workflowStep.workflowId,
      {
        workflowStepId: workflowStep.id,
        templateId: component.selectedTemplateId,
      }
    );
    expect(spinnerService.hide).toHaveBeenCalled();
  });

  it('should not call any API if workflowStep is null', () => {
    component.workflowStep = null;

    component.ngOnInit();

    expect(apiService.getAllTemplates).not.toHaveBeenCalled();
    expect(apiService.getSelectedTemplate).not.toHaveBeenCalled();
  });

  it('should not set selectedTemplateId if getSelectedTemplate returns an empty array', () => {
    const workflowStep: IWorkflowStep = {
      id: 1,
      workflowId: 1,
      executionOrder: 1,
      name: 'Test',
      type: 'SFTP',
      created: '',
      modified: '',
      workflowStepConfigurations: [],
    };
    component.workflowStep = workflowStep;

    apiService.getAllTemplates.and.returnValue(
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
        numberOfElements: 0,
      })
    );
    apiService.getSelectedTemplate.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.selectedTemplateId).toBeUndefined();
  });

  it('should not call any API in updateTemplate if workflowStep is null', () => {
    component.workflowStep = null;

    component.updateTemplate();

    expect(apiService.updateTemplateForStep).not.toHaveBeenCalled();
    expect(apiService.postTemplateForStep).not.toHaveBeenCalled();
  });
});
