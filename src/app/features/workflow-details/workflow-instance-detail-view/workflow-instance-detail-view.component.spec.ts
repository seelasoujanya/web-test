import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { WorkflowDetailViewComponent } from './workflow-instance-detail-view.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import {
  Priority,
  WorkflowInstance,
  WorkflowInstanceStatus,
} from 'src/app/core/models/workflowinstance.model';

describe('WorkflowDetailViewComponent', () => {
  let component: WorkflowDetailViewComponent;
  let fixture: ComponentFixture<WorkflowDetailViewComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let cdRef: ChangeDetectorRef;
  let router: Router;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflowInstanceDetails',
      'getArtifacts',
      'getLogsForInstance',
      'downloadArtifact',
    ]);
    cdRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    apiServiceSpy.getArtifacts.and.returnValue(
      of([
        { name: 'file1.xml', url: 'http://example.com/file1.xml' },
        { name: 'file2.json', url: 'http://example.com/file2.json' },
      ])
    );
    apiServiceSpy.getLogsForInstance.and.returnValue(of('Sample logs'));
    apiServiceSpy.downloadArtifact.and.returnValue(
      of(new Blob(['content'], { type: 'application/octet-stream' }))
    );
    await TestBed.configureTestingModule({
      imports: [
        WorkflowDetailViewComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: '123' } } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowDetailViewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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

  describe('getInstancsLogs', () => {
    it('should call getLogsForInstance and update logsResponse', () => {
      const mockLogs = '';
      component.getInstancsLogs();
      expect(component.logsResponse).toBe(mockLogs);
    });
  });

  it('should call downloadArtifact when invoked', fakeAsync(() => {
    spyOn(component, 'downloadArtifact').and.callThrough();

    component.downloadArtifact(1, 'file1.xml');
    tick();

    expect(component.downloadArtifact).toHaveBeenCalledWith(1, 'file1.xml');
  }));

  it('should handle errors in getInstancsLogs', fakeAsync(() => {
    apiService.getLogsForInstance.and.returnValue(throwError('Error'));

    component.getInstancsLogs();
    tick();

    expect(component.logsResponse).toBe('');
  }));

  it('should call getPageItems, getArtifactFiles, and getInstancsLogs on ngOnInit', () => {
    spyOn(component, 'getPageItems');
    spyOn(component, 'getArtifactFiles');
    spyOn(component, 'getInstancsLogs');

    component.ngOnInit();

    expect(component.getPageItems).toHaveBeenCalled();
    expect(component.getArtifactFiles).toHaveBeenCalled();
    expect(component.getInstancsLogs).toHaveBeenCalled();
  });

  it('should call getPageItems, getArtifactFiles, and getInstancsLogs on ngOnInit', () => {
    spyOn(component, 'getPageItems');
    spyOn(component, 'getArtifactFiles');
    spyOn(component, 'getInstancsLogs');
    component.ngOnInit();
    expect(component.getPageItems).toHaveBeenCalled();
    expect(component.getArtifactFiles).toHaveBeenCalled();
    expect(component.getInstancsLogs).toHaveBeenCalled();
  });

  describe('getInstancsLogs', () => {
    it('should handle errors in getLogsForInstance', fakeAsync(() => {
      apiService.getLogsForInstance.and.returnValue(throwError('Error'));
      component.getInstancsLogs();
      tick();
      expect(component.logsResponse).toBe('');
    }));
  });

  it('should navigate back to workflows', () => {
    spyOn(router, 'navigate');

    component.backToWorkflows();

    expect(router.navigate).toHaveBeenCalledWith(['/workflows']);
  });

  it('should return default page parameters with correct values', () => {
    const defaultParams = component.getDefaultPageParams();
    expect(defaultParams).toEqual({
      page: 0,
      pazeSize: 10,
      sortBy: '',
      order: 'asc',
    });
  });

  it('should call destroyed$.next and destroyed$.complete on ngOnDestroy', () => {
    const nextSpy = spyOn(component['destroyed$'], 'next');
    const completeSpy = spyOn(component['destroyed$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should set selectedTab to "history" when selectTab is called with "history"', () => {
    component.selectTab('history');
    expect(component.selectedTab).toBe('history');
  });

  it('should set selectedTab to "details" when selectTab is called with "details"', () => {
    component.selectTab('details');
    expect(component.selectedTab).toBe('details');
  });

  it('should return default icon path for empty filename', () => {
    const iconPath = component.getIcon('');
    expect(iconPath).toBe('assets/icons/default-file.svg');
  });

  it('should return default icon path for filename with multiple dots', () => {
    const iconPath = component.getIcon('file.with.multiple.dots.json');
    expect(iconPath).toBe('/assets/icons/json-logo.svg');
  });

  it('should handle errors in getArtifactFiles', () => {
    apiService.getArtifacts.and.returnValue(throwError('Error'));

    component.getArtifactFiles();

    expect(component.filteredFiles).toEqual([]);
  });

  it('should handle empty file list in getArtifactFiles', () => {
    apiService.getArtifacts.and.returnValue(of([]));

    component.getArtifactFiles();

    expect(component.filteredFiles).toEqual([]);
  });

  it('should call getPageItems, getArtifactFiles, and getInstancsLogs on ngOnInit', () => {
    spyOn(component, 'getPageItems');
    spyOn(component, 'getArtifactFiles');
    spyOn(component, 'getInstancsLogs');

    component.ngOnInit();

    expect(component.getPageItems).toHaveBeenCalled();
    expect(component.getArtifactFiles).toHaveBeenCalled();
    expect(component.getInstancsLogs).toHaveBeenCalled();
  });
});
