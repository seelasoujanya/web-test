import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTableComponent } from './workflow-table.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Workflow } from 'src/app/core/models/workflow.model';
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
    ]);

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

  it('should emit workflowUpdateEvent when pauseWorkflow is called and isWorkflow is true', () => {
    component.isWorkflow = true;
    spyOn(component.workflowUpdateEvent, 'emit');
    const workflow: Workflow = {
      id: 1,
      name: 'Test Workflow',
      enabled: false,
      paused: false,
      created: '',
      modified: '',
      status: '',
    };
    const event = new MouseEvent('click');
    component.pauseWorkflow(event, workflow);
    expect(component.workflowUpdateEvent.emit).toHaveBeenCalledWith(workflow);
  });

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
});
