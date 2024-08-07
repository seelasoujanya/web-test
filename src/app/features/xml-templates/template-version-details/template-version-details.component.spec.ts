import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateVersionDetailsComponent } from './template-version-details.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

describe('TemplateVersionDetailsComponent', () => {
  let component: TemplateVersionDetailsComponent;
  let fixture: ComponentFixture<TemplateVersionDetailsComponent>;
  let formBuilder: FormBuilder;

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
});
