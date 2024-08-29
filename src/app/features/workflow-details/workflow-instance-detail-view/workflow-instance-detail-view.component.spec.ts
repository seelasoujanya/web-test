import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailViewComponent } from './workflow-instance-detail-view.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import {
  Priority,
  WorkflowInstance,
  WorkflowInstanceStatus,
} from 'src/app/core/models/workflowinstance.model';

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
      'downloadArtifact',
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
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
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

  describe('secondsToHHMMSS', () => {
    it('should return an empty string when seconds is null', () => {
      const result = component.secondsToHHMMSS(null);
      expect(result).toBe('');
    });

    it('should correctly convert 0 seconds to "00:00:00"', () => {
      const result = component.secondsToHHMMSS(0);
      expect(result).toBe('00:00:00');
    });

    it('should correctly convert seconds to HH:MM:SS format', () => {
      const result = component.secondsToHHMMSS(3661);
      expect(result).toBe('01:01:01');
    });

    it('should correctly convert seconds with no hours to "00:MM:SS"', () => {
      const result = component.secondsToHHMMSS(61);
      expect(result).toBe('00:01:01');
    });

    it('should correctly convert seconds with minutes and seconds to "00:MM:SS"', () => {
      const result = component.secondsToHHMMSS(3599);
      expect(result).toBe('00:59:59');
    });

    it('should correctly handle large numbers of seconds', () => {
      const result = component.secondsToHHMMSS(86400);
      expect(result).toBe('24:00:00');
    });
  });

  it('should complete destroyed$ when ngOnDestroy is called', () => {
    spyOn(component['destroyed$'], 'next');
    spyOn(component['destroyed$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroyed$'].next).toHaveBeenCalled();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  });
});
