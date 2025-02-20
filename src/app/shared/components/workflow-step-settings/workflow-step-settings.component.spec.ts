import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowStepSettingsComponent } from './workflow-step-settings.component';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WorkflowStepSettingsComponent', () => {
  let component: WorkflowStepSettingsComponent;
  let fixture: ComponentFixture<WorkflowStepSettingsComponent>;
  let apiService: ApiService;
  let spinnerService: SpinnerService;
  let modalService: BsModalService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        NgSelectModule,
        TooltipModule,
        HttpClientTestingModule,
      ],
      providers: [ApiService, SpinnerService, BsModalService, Router],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowStepSettingsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    spinnerService = TestBed.inject(SpinnerService);
    modalService = TestBed.inject(BsModalService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // Test case 1: Should create the component
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case 2: Test component initialization
  it('should initialize component with default values', () => {
    fixture.detectChanges();
    expect(component.enableEditing).toBe(false);
    expect(component.stepConfigurationSection).toBeUndefined();
    expect(component.workflowStep).toBeNull();
  });

  // Test case 4: Test fetchXSDValidatorFiles
  it('should fetch XSD validator files', () => {
    const mockFiles = ['file1.xsd', 'file2.xsd'];
    spyOn(apiService, 'fetchXSDValidatorFiles').and.returnValue(of(mockFiles));
    component.fetchXSDValidatorFiles();
    expect(component.xsdValidatorFiles).toEqual(mockFiles);
  });

  // Test case 6: Test onTemplateChange
  it('should fetch template versions on template change', () => {
    const mockTemplateVersions = [{ id: 1 }, { id: 2 }];
    component.selectedTemplateId = 1;
    spyOn(apiService, 'getTemplatesByTemplateId').and.returnValue(
      of(mockTemplateVersions)
    );
    component.onTemplateChange(1);
    expect(component.templateVersions).toEqual(mockTemplateVersions);
  });

  // Test case 7: Test toggleEditing
  it('should toggle enableEditing', () => {
    component.toggleEditing();
    expect(component.enableEditing).toBe(true);
    component.toggleEditing();
    expect(component.enableEditing).toBe(false);
  });

  // Test case 8: Test saveWorkflowSettingsChanges
  it('should trigger confirm modal on save workflow settings changes', () => {
    const mockStep = 'Test Step';
    spyOn(component, 'openConfirmModal');
    component.saveWorkflowSettingsChanges(mockStep);
    expect(component.openConfirmModal).toHaveBeenCalled();
  });

  // Test case 12: Test onValidatorFileChange
  it('should update selectedValidatorFile when file is changed', () => {
    const selectedFile = 'newValidator.xsd';
    component.onValidatorFileChange(selectedFile);
    expect(component.selectedValidatorFile).toBe(selectedFile);
  });
});
