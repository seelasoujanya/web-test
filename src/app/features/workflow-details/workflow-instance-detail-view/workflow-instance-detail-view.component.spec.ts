import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailViewComponent } from './workflow-instance-detail-view.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

const mockArtifacts = [{ name: 'file1.xml' }, { name: 'file2.json' }];

describe('WorkflowDetailViewComponent', () => {
  let component: WorkflowDetailViewComponent;
  let fixture: ComponentFixture<WorkflowDetailViewComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let cdRef: ChangeDetectorRef;
  let router: Router;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflowInstanceDetails',
      'getArtifacts',
      'getLogsForInstance',
    ]);
    cdRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    apiServiceSpy.getArtifacts.and.returnValue(of({ content: mockArtifacts }));

    await TestBed.configureTestingModule({
      imports: [
        WorkflowDetailViewComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailViewComponent);
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

  it('should navigate to workflows', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.backToWorkflows();

    expect(navigateSpy).toHaveBeenCalledWith(['/workflows']);
  });

  it('should set selectedTab when selectTab is called', () => {
    const tab = 'history';
    component.selectTab(tab);
    expect(component.selectedTab).toBe(tab);
  });

  describe('getIcon', () => {
    it('should return the XML icon path for XML files', () => {
      const iconPath = component.getIcon('file.xml');
      expect(iconPath).toBe('/assets/icons/xml-logo.svg');
    });

    it('should return the JSON icon path for JSON files', () => {
      const iconPath = component.getIcon('file.json');
      expect(iconPath).toBe('/assets/icons/json-logo.svg');
    });

    it('should return the default icon path for other file types', () => {
      const iconPath1 = component.getIcon('file.txt');
      const iconPath2 = component.getIcon('file');

      expect(iconPath1).toBe('assets/icons/default-file.svg');
      expect(iconPath2).toBe('assets/icons/default-file.svg');
    });

    it('should handle filenames with multiple dots correctly', () => {
      const iconPath = component.getIcon('file.name.with.dots.xml');
      expect(iconPath).toBe('/assets/icons/xml-logo.svg');
    });

    it('should handle filenames without an extension correctly', () => {
      const iconPath = component.getIcon('filename');
      expect(iconPath).toBe('assets/icons/default-file.svg');
    });
  });

  it('should return default page parameters', () => {
    const defaultParams = component.getDefaultPageParams();
    expect(defaultParams).toEqual({
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    });
  });

  // it('should set filteredFiles when getArtifactFiles is called', () => {
  //   component.workflowInstanceId = '123';
  //   component.getArtifactFiles();
  //   fixture.detectChanges();
  //   expect(component.filteredFiles).toEqual(mockArtifacts);
  // });

  // it('should set logsResponse when getInstancsLogs is called', () => {
  //   const mockLogsResponse =  '';
  //   apiServiceSpy.getLogsForInstance.and.returnValue(of(mockLogsResponse));

  //   component.workflowInstanceId = '123';
  //   component.getInstancsLogs();

  //   fixture.detectChanges();

  //   expect(component.logsResponse).toEqual(mockLogsResponse);
  //   expect(apiServiceSpy.getLogsForInstance).toHaveBeenCalledWith(123);
  // });
});
