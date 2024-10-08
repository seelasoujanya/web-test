import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsComponent } from './workflows.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { of } from 'rxjs';
import { Workflow } from 'src/app/core/models/workflow.model';
import { IPage } from 'src/app/core/models/page.model';

describe('WorkflowsComponent', () => {
  let component: WorkflowsComponent;
  let fixture: ComponentFixture<WorkflowsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;
  let cdRef: jasmine.SpyObj<ChangeDetectorRef>;
  let spinnerService: jasmine.SpyObj<SpinnerService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflows',
      'updateWorkflow',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
    ]);
    const spinnerServiceSpy = jasmine.createSpyObj('SpinnerService', [
      'show',
      'hide',
    ]);

    await TestBed.configureTestingModule({
      imports: [WorkflowsComponent, HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: cdRefSpy },
        { provide: SpinnerService, useValue: spinnerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    cdRef = TestBed.inject(
      ChangeDetectorRef
    ) as jasmine.SpyObj<ChangeDetectorRef>;
    spinnerService = TestBed.inject(
      SpinnerService
    ) as jasmine.SpyObj<SpinnerService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly sort and call getPageItems with the updated parameters', () => {
    const mockEvent = {
      sortBy: 'Workflow Name',
      order: 'desc',
    };
    const expectedSortBy = 'name';
    spyOn(component, 'getPageItems');
    component.sortColumn(mockEvent);
    expect(component.pageParams.sortBy).toBe(expectedSortBy);
    expect(component.pageParams.order).toBe(mockEvent.order);
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should filter workflows based on the search term and update filteredWorkflows', () => {
    const searchTerm = 'test workflow';
    component.workflowName = searchTerm;
    component.workflowsData = [
      {
        name: 'Test Workflow 1',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: '',
      },
    ];
    const expectedFilteredWorkflows = [
      {
        name: 'Test Workflow 1',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: '',
      },
    ];
    component.searchWorkflow();
    expect(component.filteredWorkflows).toEqual(expectedFilteredWorkflows);
    expect(component.noWorkflows).toBe(false);
  });

  it('should reset filteredWorkflows if search term is empty and noWorkflows should be false', () => {
    component.workflowName = '';
    component.workflowsData = [
      {
        name: 'Test Workflow 1',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: '',
      },
      {
        name: 'Another Workflow',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: '',
      },
    ];
    component.searchWorkflow();
    expect(component.filteredWorkflows).toEqual(component.workflowsData);
    expect(component.noWorkflows).toBe(false);
  });

  it('should set noWorkflows to true if there are no matching workflows', () => {
    const searchTerm = 'nonexistent workflow';
    component.workflowName = searchTerm;
    component.workflowsData = [
      {
        name: 'Test Workflow 1',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: '',
      },
      {
        name: 'Another Workflow',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: '',
      },
    ];
    component.searchWorkflow();
    expect(component.filteredWorkflows.length).toBe(0);
    expect(component.noWorkflows).toBe(true);
  });

  it('should call getPageItems with updated pageParams on onPage', () => {
    const pageNumber = 2;
    spyOn(component, 'getPageItems');
    component.onPage(pageNumber);
    expect(component.pageParams.page).toBe(pageNumber - 1);
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should show and hide spinner during API call', () => {
    spyOn(component, 'getPageItems').and.callThrough();
    component.getPageItems(component.pageParams);
    expect(spinnerService.show).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  it('should call destroyed$.next and destroyed$.complete in ngOnDestroy', () => {
    spyOn(component['destroyed$'], 'next');
    spyOn(component['destroyed$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroyed$'].next).toHaveBeenCalled();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  });

  it('should navigate to the correct route with workflow data on viewInstances', () => {
    const mockWorkflow = { id: 1, name: 'Test Workflow' };
    component.viewInstances(mockWorkflow);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/workflows', mockWorkflow.id],
      {
        state: { name: mockWorkflow.name },
      }
    );
  });

  it('should call getPageItems with default pageParams on ngOnInit', () => {
    spyOn(component, 'getPageItems');

    component.ngOnInit();

    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should instantiate all dependencies correctly in the constructor', () => {
    expect(apiService).toBeTruthy();
    expect(router).toBeTruthy();
    expect(cdRef).toBeTruthy();
    expect(spinnerService).toBeTruthy();
  });

  it('should call getPageItems with default pageParams on ngOnInit', () => {
    spyOn(component, 'getPageItems').and.callThrough();
    component.ngOnInit();
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should correctly handle data returned from getWorkflows', () => {
    const mockPage: IPage<any> = {
      content: [
        { id: 1, name: 'Test Workflow 1' },
        { id: 2, name: 'Test Workflow 2' },
      ],
      totalElements: 0,
      size: 0,
      number: 0,
      totalPages: 0,
      numberOfElements: 0,
    };

    apiService.getWorkflows.and.returnValue(of(mockPage));
    component.getPageItems(component.pageParams);

    fixture.whenStable().then(() => {
      expect(component.page).toEqual(mockPage);
      expect(component.workflowsData).toEqual(mockPage.content);
    });
  });
});
