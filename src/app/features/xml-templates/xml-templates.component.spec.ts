import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlTemplatesComponent } from './xml-templates.component';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

describe('XmlTemplatesComponent', () => {
  let component: XmlTemplatesComponent;
  let fixture: ComponentFixture<XmlTemplatesComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlTemplatesComponent, HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(XmlTemplatesComponent);
    component = fixture.componentInstance;
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

  it('should navigate to the correct route with the given templateId', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const templateId = 123;
    const expectedUrl = ['/template', templateId];

    component.navigateToTemplateDetails(templateId);

    expect(navigateSpy).toHaveBeenCalledWith(expectedUrl);
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
});
