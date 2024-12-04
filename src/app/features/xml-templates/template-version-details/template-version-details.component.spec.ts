import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateVersionDetailsComponent } from './template-version-details.component';
import { ApiService } from 'src/app/core/services/api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TimeFormatService } from 'src/app/time-format.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TemplateVersionDetailsComponent', () => {
  let component: TemplateVersionDetailsComponent;
  let fixture: ComponentFixture<TemplateVersionDetailsComponent>;
  let apiService: ApiService;
  let spinnerService: SpinnerService;
  let router: Router;
  let bsModalService: BsModalService;
  let activatedRoute: ActivatedRoute;

  const mockData = [
    {
      id: 1,
      templateCode: 'code1',
      created: '2024-12-01T00:00:00Z',
      template: {
        name: 'Template Name',
        description: 'Template Description',
      },
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        NgSelectModule,
        CommonModule,
        CodemirrorModule,
        TooltipModule,
        TemplateVersionDetailsComponent,
        ConfirmModalComponent,
        HttpClientModule,
        HttpClientTestingModule,
      ],
      providers: [
        FormBuilder,
        ApiService,
        BsModalService,
        SpinnerService,
        TimeFormatService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: '1' } } },
        },
        BsModalRef,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateVersionDetailsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    spinnerService = TestBed.inject(SpinnerService);
    router = TestBed.inject(Router);
    bsModalService = TestBed.inject(BsModalService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(apiService, 'getTemplatesByTemplateId').and.returnValue(of(mockData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.templateId).toBe(1);
  });

  it('should call getTemplatesByTemplateId on ngOnInit', () => {
    const spy = spyOn(component, 'getTemplatesByTemplateId');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should toggle isEditableTemplate correctly', () => {
    const initialValue = component.isReadOnly;
    component.isEditableTemplate();
    expect(component.isReadOnly).toBe(!initialValue);
    expect(component.enableEditing).toBe(true);
  });

  it('should call getTemplateUsages with the correct id', () => {
    const spy = spyOn(component, 'getTemplateUsages');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should enable form for editing on isEditableTemplate', () => {
    component.isEditableTemplate();
    expect(component.reactiveForm.get('code')?.enabled).toBeTrue();
  });

  it('should disable form when cancelChanges is called', () => {
    component.cancelChanges();
    expect(component.reactiveForm.get('code')?.enabled).toBeFalse();
  });

  it('should select a template when selectTemplate is called', () => {
    component.xmlTemplatesById = [
      { templateCode: 'code1', id: 1 },
      { templateCode: 'code2', id: 2 },
    ];
    component.selectTemplate(1);
    expect(component.selectedTemplate).toBe('code2');
  });

  it('should update the template details', () => {
    const spy = spyOn(apiService, 'updateTemplate').and.returnValue(of({}));
    component.updateTemplateDetails();
    expect(spy).toHaveBeenCalled();
  });

  it('should close modal correctly and reset properties', () => {
    const modalRefMock = jasmine.createSpyObj('BsModalRef', ['hide']);

    component['bsModalRef'] = modalRefMock;

    component.showDifferences = true;
    component.compareTemplate.firstTemplate = 'template1';
    component.compareTemplate.secondTemplate = 'template2';

    component.closeModal();
    expect(component.showDifferences).toBeFalse();
    expect(component.compareTemplate.firstTemplate).toBe('');
    expect(component.compareTemplate.secondTemplate).toBe('');
  });

  describe('getDefaultPageParams', () => {
    it('should return the default page parameters', () => {
      const expectedParams = {
        page: 0,
        pageSize: 10,
        sortBy: '',
        order: 'asc',
      };

      const params = component.getDefaultPageParams();

      expect(params).toEqual(expectedParams);
    });
  });

  it('should delegate to timeFormatService.formatDate', () => {
    const mockDate = new Date('2024-12-01T10:00:00');
    const formatDateSpy = spyOn(
      component['timeFormatService'],
      'formatDate'
    ).and.returnValue({ date: '01/01/2024', time: '12:00 PM' });

    const formattedDate = component.formatDate(mockDate);

    expect(formatDateSpy).toHaveBeenCalledWith(mockDate);
  });

  describe('cancelChangesToUpdateTemplate', () => {
    it('should reset the editedTemplate, showDifferences, and compareTemplate properties', () => {
      component.editedTemplate = 'some template';
      component.showDifferences = true;
      component.compareTemplate.firstTemplate = 'first template';
      component.compareTemplate.secondTemplate = 'second template';
      component.cancelChangesToUpdateTemplate();
      expect(component.editedTemplate).toBe('');
      expect(component.showDifferences).toBe(false);
      expect(component.compareTemplate.firstTemplate).toBe('');
      expect(component.compareTemplate.secondTemplate).toBe('');
    });
  });

  it('should set firstTemplate and originalCode properties correctly', () => {
    const firstTemplateMock = {
      templateCode: 'ABC123',
      name: 'Template 1',
    };
    component.selectFirstTemplate(firstTemplateMock);
    expect(component.firstTemplate).toBe(firstTemplateMock);
    expect(component.originalCode).toBe('ABC123');
  });

  it('should set secondTemplate and modifiedCode properties correctly', () => {
    const secondTemplateMock = {
      templateCode: 'XYZ789',
      name: 'Template 2',
    };
    component.selectSecondTemplate(secondTemplateMock);

    expect(component.secondTemplate).toBe(secondTemplateMock);
    expect(component.modifiedCode).toBe('XYZ789');
  });

  describe('compareChanges', () => {
    it('should set showDifferences to true', () => {
      component.showDifferences = false;
      component.compareChanges();
      expect(component.showDifferences).toBe(true);
    });
  });

  describe('isCompareAllowed', () => {
    it('should return true if compareTemplate.description is not empty or whitespace', () => {
      component.compareTemplate = {
        firstTemplate: '',
        secondTemplate: '',
        description: 'Some description',
      };
      expect(component.isCompareAllowed()).toBe(true);
    });

    it('should return false if compareTemplate.description is empty', () => {
      component.compareTemplate = {
        firstTemplate: '',
        secondTemplate: '',
        description: '',
      };
      expect(component.isCompareAllowed()).toBe(false);
    });
  });
});
