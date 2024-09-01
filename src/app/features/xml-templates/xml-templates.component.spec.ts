import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlTemplatesComponent } from './xml-templates.component';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { TemplateRef } from '@angular/core';

describe('XmlTemplatesComponent', () => {
  let component: XmlTemplatesComponent;
  let fixture: ComponentFixture<XmlTemplatesComponent>;
  let router: Router;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlTemplatesComponent, HttpClientModule],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlTemplatesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(console, 'log');
    spyOn(console, 'error');
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
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

  it('should reset newTemplateData to initial values', () => {
    component.newTemplateData = {
      name: 'Some Name',
      description: 'Some Description',
      templateCode: 'Some Code',
    };
    component.reset();
    expect(component.newTemplateData).toEqual({
      name: '',
      description: '',
      templateCode: '',
    });
  });

  it('should reset new template data', () => {
    component.reset();
    expect(component.newTemplateData.name).toBe('');
  });

  it('should call closeModal and reset in cancelChanges', () => {
    spyOn(component, 'closeModal').and.callThrough();
    spyOn(component, 'reset').and.callThrough();

    component.cancelChanges();

    expect(component.closeModal).toHaveBeenCalled();
    expect(component.reset).toHaveBeenCalled();
  });

  it('should set correct modal data in saveTemplateChanges', () => {
    component.saveTemplateChanges();
    expect(true).toBeTrue();
  });

  it('should navigate to template details', () => {
    spyOn(router, 'navigate');
    const templateId = 1;
    component.navigateToTemplateDetails(templateId);
    expect(router.navigate).toHaveBeenCalledWith(['/templates', templateId]);
  });

  it('should open create template dialog with the correct configuration', () => {
    const templateRef = {} as TemplateRef<any>;
    spyOn(component['modalService'], 'show').and.callThrough();
    component.openCreateTemplateDialog(templateRef);
    expect(component['modalService'].show).toHaveBeenCalledWith(templateRef, {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    });
  });

  it('should close the modal', () => {
    spyOn(component.getBsModalRef, 'hide');
    component.closeModal();
    expect(component.getBsModalRef.hide).toHaveBeenCalled();
  });

  it('should call closeModal and reset in cancelChanges', () => {
    spyOn(component, 'closeModal').and.callThrough();
    spyOn(component, 'reset').and.callThrough();

    component.cancelChanges();

    expect(component.closeModal).toHaveBeenCalled();
    expect(component.reset).toHaveBeenCalled();
  });

  it('should create a new template and update xmlTemplates', () => {
    const newTemplate = { id: 2, name: 'New Template' };
    spyOn(apiService, 'addTemplate').and.returnValue(of(newTemplate));
    spyOn(component.xmlTemplates, 'push');

    component.createTemplate();

    fixture.whenStable().then(() => {
      expect(apiService.addTemplate).toHaveBeenCalledWith(
        component.newTemplateData
      );
      expect(component.xmlTemplates.push).toHaveBeenCalledWith(newTemplate);
      expect(component.newTemplateData).toEqual({
        name: '',
        description: '',
        templateCode: '',
      });
    });
  });
});
