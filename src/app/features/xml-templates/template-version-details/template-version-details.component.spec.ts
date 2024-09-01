import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateVersionDetailsComponent } from './template-version-details.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TemplateRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

describe('TemplateVersionDetailsComponent', () => {
  let component: TemplateVersionDetailsComponent;
  let fixture: ComponentFixture<TemplateVersionDetailsComponent>;
  let formBuilder: FormBuilder;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TemplateVersionDetailsComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateVersionDetailsComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('editorInit', () => {
    it('should set the selection on the editor', () => {
      const mockEditor = {
        setSelection: jasmine.createSpy('setSelection'),
      };

      component.editorInit(mockEditor);

      expect(mockEditor.setSelection).toHaveBeenCalledWith({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 3,
        endColumn: 50,
      });
    });
  });

  it('should correctly select a template and update the form', () => {
    // Set up mock data
    const mockTemplates = [
      { templateCode: 'Template 1' },
      { templateCode: 'Template 2' },
      { templateCode: 'Template 3' },
    ];

    component.xmlTemplatesById = mockTemplates;
    component.reactiveForm = formBuilder.group({
      code: [''],
    });

    const id = 1;
    component.selectTemplate(id);

    const expectedIndex = mockTemplates.length - 1 - id;
    expect(component.selectedTemplateIndex).toBe(id);
    expect(component.selectedTemplate).toBe(
      mockTemplates[expectedIndex].templateCode
    );
    expect(component.reactiveForm.get('code')?.value).toBe(
      component.selectedTemplate
    );
  });

  it('should reset properties to their default values', () => {
    component.cancelChangesToUpdateTemplate();
    expect(component.editedTemplate).toBe('');
    expect(component.showDifferences).toBe(false);
    expect(component.compareTemplate.firstTemplate).toBe('');
    expect(component.compareTemplate.secondTemplate).toBe('');
  });

  it('should select the first template and update the originalCode', () => {
    const mockTemplate = {
      templateCode: 'sample-template-code',
    };

    component.selectFirstTemplate(mockTemplate);
    expect(component.firstTemplate).toBe(mockTemplate);
    expect(component.originalCode).toBe(mockTemplate.templateCode);
  });

  it('should select the second template and update the modifiedCode', () => {
    const mockTemplate = {
      templateCode: 'sample-template-code',
    };

    component.selectSecondTemplate(mockTemplate);
    expect(component.secondTemplate).toBe(mockTemplate);
    expect(component.modifiedCode).toBe(mockTemplate.templateCode);
  });

  it('should compare changes', () => {
    component.showDifferences = false;
    component.compareChanges();
    expect(component.showDifferences).toBe(true);
  });

  it('should call getTemplatesByTemplateId on ngOnInit', () => {
    spyOn(component, 'getTemplatesByTemplateId');
    component.ngOnInit();
    expect(component.getTemplatesByTemplateId).toHaveBeenCalledWith(
      component.templateId
    );
  });

  it('should toggle enableEditing on toggleEditing', () => {
    component.enableEditing = false;
    component.toggleEditing();
    expect(component.enableEditing).toBe(true);
    component.toggleEditing();
    expect(component.enableEditing).toBe(false);
  });

  it('should toggle detailEditing on toggleDetailEditing', () => {
    component.detailEditing = false;
    component.toggleDetailEditig();
    expect(component.detailEditing).toBe(true);
    component.toggleDetailEditig();
    expect(component.detailEditing).toBe(false);
  });

  it('should merge options correctly', () => {
    const partialOptions = { page: 1, pageSize: 20 };
    const result = component.mergeOptions(partialOptions);
    expect(result).toEqual(partialOptions);
  });

  it('should toggle isReadOnly and enableEditing on isEditableTemplate', () => {
    component.isReadOnly = true;
    component.enableEditing = false;
    component.isEditableTemplate();
    expect(component.isReadOnly).toBe(false);
    expect(component.enableEditing).toBe(true);
  });

  it('should open compare dialog with correct configuration', () => {
    const mockTemplateRef = {} as TemplateRef<any>;
    spyOn(component['modalService'], 'show').and.callThrough();

    component.openCompareDialog(mockTemplateRef);

    expect(component['modalService'].show).toHaveBeenCalledWith(
      mockTemplateRef,
      {
        backdrop: true,
        ignoreBackdropClick: true,
        keyboard: false,
      }
    );
  });

  it('should close the modal and reset comparison properties', () => {
    spyOn(component.getBsModalRef, 'hide');

    component.closeModal();

    expect(component.getBsModalRef.hide).toHaveBeenCalled();
    expect(component.showDifferences).toBe(false);
    expect(component.compareTemplate.firstTemplate).toBe('');
    expect(component.compareTemplate.secondTemplate).toBe('');
  });

  it('should return true when compareTemplate.description is not empty', () => {
    component.compareTemplate.description = 'Some description';
    expect(component.isCompareAllowed()).toBe(true);
  });

  it('should return false when compareTemplate.description is empty', () => {
    component.compareTemplate.description = '';
    expect(component.isCompareAllowed()).toBe(false);
  });

  it('should navigate to /templates on backToWorkflows', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.backToWorkflows();
    expect(navigateSpy).toHaveBeenCalledWith(['/templates']);
  });

  it('should update template details and refresh templates', () => {
    const apiService = (component as any).apiService;

    spyOn(apiService, 'updateTemplate').and.returnValue(of({}));
    spyOn(component, 'getTemplatesByTemplateId');

    component.updateTemplateDetails();

    expect(apiService.updateTemplate).toHaveBeenCalledWith(
      component.templateId,
      {
        id: component.templateId,
        name: component.templateName,
        description: component.templateDescription,
      }
    );
    expect(component.getTemplatesByTemplateId).toHaveBeenCalledWith(
      component.templateId
    );
  });
});
