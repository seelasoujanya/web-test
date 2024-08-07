import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowDetailViewComponent } from './workflow-detail-view.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('WorkflowDetailViewComponent', () => {
  let component: WorkflowDetailViewComponent;
  let fixture: ComponentFixture<WorkflowDetailViewComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let cdRef: ChangeDetectorRef;
  let router: Router;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflowInstanceDetails',
    ]);
    cdRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        WorkflowDetailViewComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
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

  describe('selectFiles', () => {
    beforeEach(() => {
      spyOn(component, 'filterFiles');
    });

    it('should set selectedButton to the passed button', () => {
      component.selectFiles('xml');

      expect(component.selectedButton).toBe('xml');
    });

    it('should clear filteredFiles array', () => {
      component.filteredFiles = ['someFile'];
      component.selectFiles('xml');

      expect(component.filteredFiles).toEqual([]);
    });

    it('should call filterFiles when button is xml', () => {
      component.selectFiles('xml');

      expect(component.filterFiles).toHaveBeenCalled();
    });

    it('should set filteredFiles to stepList when button is not xml', () => {
      component.stepList = ['step1', 'step2'];
      component.selectFiles('json');

      expect(component.filteredFiles).toEqual(['step1', 'step2']);
    });
  });

  describe('filterFiles', () => {
    it('should filter stepList to include only XML files', () => {
      component.stepList = [
        { filename: 'file1.xml' },
        { filename: 'file2.json' },
        { filename: 'file3.xml' },
        { filename: 'file4.txt' },
      ];

      component.filterFiles();

      expect(component.filteredFiles).toEqual([
        { filename: 'file1.xml' },
        { filename: 'file3.xml' },
      ]);
    });

    it('should set filteredFiles to an empty array if no XML files are found', () => {
      component.stepList = [
        { filename: 'file1.json' },
        { filename: 'file2.txt' },
      ];

      component.filterFiles();

      expect(component.filteredFiles).toEqual([]);
    });
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
});
