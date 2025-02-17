import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTableComponent } from './workflow-table.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SystemProperty, Workflow } from 'src/app/core/models/workflow.model';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

describe('WorkflowTableComponent', () => {
  let component: WorkflowTableComponent;
  let fixture: ComponentFixture<WorkflowTableComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getArtifacts',
      'getLogsForInstance',
      'downloadArtifact',
      'getPausedProperty',
      'updateWorkflow',
    ]);

    apiServiceSpy.getPausedProperty.and.returnValue(of(true));
    apiServiceSpy.updateWorkflow.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [WorkflowTableComponent, CommonModule, HttpClientModule],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowTableComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit increasePageEvent when increaseLimitWorkflows is called', () => {
    spyOn(component.increasePageEvent, 'emit');
    component.increaseLimitWorkflows();
    expect(component.increasePageEvent.emit).toHaveBeenCalledWith(true);
  });

  it('should emit workflowDetailEvent with id and name when viewInstances is called and isWorkflow is true', () => {
    component.isWorkflow = true;
    spyOn(component.workflowDetailEvent, 'emit');
    const workflowId = 1;
    const workflowName = 'Test Workflow';
    component.viewInstances(workflowId, workflowName);
    expect(component.workflowDetailEvent.emit).toHaveBeenCalledWith({
      id: workflowId,
      name: workflowName,
    });
  });

  it('should emit workflowDetailEvent with id when viewInstanceDetails is called', () => {
    spyOn(component.workflowDetailEvent, 'emit');
    const workflowId = 1;
    component.viewInstanceDetails(workflowId);
    expect(component.workflowDetailEvent.emit).toHaveBeenCalledWith({
      id: workflowId,
    });
  });

  // it('should emit workflowUpdateEvent when pauseWorkflow is called and isWorkflow is true', () => {
  //   component.isWorkflow = true;
  //   spyOn(component.workflowUpdateEvent, 'emit');
  //   const workflow: Workflow = {
  //     id: 1,
  //     name: 'Test Workflow',
  //     enabled: false,
  //     paused: false,
  //     created: '',
  //     modified: '',
  //     status: 'ACTIVE',
  //     alias: '',
  //     description: undefined,
  //     throttleLimit: undefined,
  //     isTaskChainIsValid: undefined
  //   };
  //   const event = new MouseEvent('click');
  //   component.pauseWorkflow(event, workflow);
  //   expect(component.workflowUpdateEvent.emit).toHaveBeenCalledWith(workflow);
  // });

  it('should toggle currentSort and emit getSortParam when sortColumn is called', () => {
    spyOn(component.getSortParam, 'emit');
    const heading = 'Workflow Name';

    component.sortColumn(heading);
    expect(component.selectedHeading).toBe(heading);
    expect(component.currentSort).toBe('desc');
    expect(component.getSortParam.emit).toHaveBeenCalledWith({
      sortBy: heading,
      order: 'desc',
    });

    component.sortColumn(heading); // Toggle back
    expect(component.currentSort).toBe('asc');
    expect(component.getSortParam.emit).toHaveBeenCalledWith({
      sortBy: heading,
      order: 'asc',
    });
  });

  it('should update stepList with result from apiService.getArtifacts when getArtifactFiles is called and isWorkflow is false', () => {
    component.isWorkflow = false;
    const workflow: Workflow = { id: 1, name: 'Test Workflow' } as Workflow;
    const mockResult = [{ id: 1, name: 'Artifact 1' }];
    apiService.getArtifacts.and.returnValue(of(mockResult));
    component.getArtifactFiles(workflow);
    expect(apiService.getArtifacts).toHaveBeenCalledWith(workflow.id);
    expect(component.stepList).toEqual(mockResult);
  });

  it('should update logsResponse with result from apiService.getLogsForInstance when getInstancsLogs is called and isWorkflow is false', () => {
    component.isWorkflow = false;
    const workflow: Workflow = { id: 1, name: 'Test Workflow' } as Workflow;
    const mockResult = 'log1[log2[log3';
    apiService.getLogsForInstance.and.returnValue(of(mockResult));
    component.getInstancsLogs(workflow);
    expect(apiService.getLogsForInstance).toHaveBeenCalledWith(workflow.id);
    expect(component.logsResponse).toEqual(['log1', 'log2', 'log3']);
  });

  it('should handle error when downloadArtifact fails', () => {
    component.isWorkflow = false;
    const artifactId = 1;
    const fileName = 'file.txt';
    const error = new Error('Download failed');
    apiService.downloadArtifact.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.downloadArtifact(artifactId, fileName);

    expect(console.error).toHaveBeenCalledWith(
      'Error downloading file:',
      error
    );
  });

  it('should handle missing file name in downloadArtifact', () => {
    component.isWorkflow = false;
    const artifactId = 1;
    const error = new Error('Download failed');
    apiService.downloadArtifact.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.downloadArtifact(artifactId, '');

    expect(console.error).toHaveBeenCalledWith(
      'Error downloading file:',
      error
    );
  });

  it('should toggle paused state and update workflow when togglePaused is called', () => {
    component.isPauseProperty = false;
    const workflow: Workflow = {
      id: 1,
      name: 'Test Workflow',
      paused: false,
    } as Workflow;
    const event = new Event('click');
    spyOn(component.reload, 'emit');

    component.togglePaused(event, workflow);

    expect(workflow.paused).toBe(true);
    expect(apiService.updateWorkflow).toHaveBeenCalledWith(workflow.id, {
      paused: true,
    });
    expect(component.reload.emit).toHaveBeenCalledWith(workflow);
  });

  it('should update pausedProperty and isPauseProperty when getPausedProperty is called', () => {
    component.getPausedProperty('paused');

    expect(apiService.getPausedProperty).toHaveBeenCalledWith('paused');
  });

  it('should return true from isToggle when isPauseProperty is true', () => {
    component.isPauseProperty = true;
    const result = component.isToggle(false);
    expect(result).toBeTrue();
  });

  it('should return isPaused value from isToggle when isPauseProperty is false', () => {
    component.isPauseProperty = false;
    const result = component.isToggle(true);
    expect(result).toBeTrue();
  });

  it('should return correct display name for delivery types', () => {
    expect(component.getDisplayName('DATA_ONLY')).toBe('Data Only');
    expect(component.getDisplayName('PACKSHOT')).toBe('Packshot');
    expect(component.getDisplayName('FULL_DELIVERY')).toBe('Full Delivery');
    expect(component.getDisplayName('SCREENGRAB')).toBe('Screengrab');
    expect(component.getDisplayName('COVER_ART')).toBe('Cover Art');
    expect(component.getDisplayName('INSERT')).toBe('Insert');
    expect(component.getDisplayName('TAKE_DOWN')).toBe('Takedown');
    expect(component.getDisplayName('UNKNOWN')).toBe('None'); // Default case
  });

  it('should convert milliseconds into readable time format', () => {
    expect(component.convertMilliSeconds(3600000)).toBe('1h');
    expect(component.convertMilliSeconds(60000)).toBe('1m');
    expect(component.convertMilliSeconds(1000)).toBe('1s 0ms');
    expect(component.convertMilliSeconds(10)).toBe('1ms');
    expect(component.convertMilliSeconds(0)).toBe('0ms');
    expect(component.convertMilliSeconds(null)).toBe('');
  });
});
