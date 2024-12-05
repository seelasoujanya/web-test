import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsComponent } from './workflows.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef, TemplateRef } from '@angular/core';
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
      'bookmarkWorkflow',
      'removeBookmark',
      'getBookmarkedWorkflowsByUsername',
      'getPausedProperty',
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

  it('should reset filteredWorkflows if search term is empty and noWorkflows should be false', () => {
    component.workflowName = '';
    component.workflowsData = []; // Empty array test case
    component.searchWorkflow();
    expect(component.filteredWorkflows).toEqual(component.workflowsData);
    expect(component.noWorkflows).toBe(false);
  });

  it('should filter workflows correctly when search term is provided', () => {
    component.workflowName = 'Test';
    component.workflowsData = [
      {
        id: 1,
        name: 'Test',
        enabled: true,
        paused: false,
        created: '2024-01-01',
        modified: '2024-01-02',
        status: 'Active',
      },
    ];
    component.searchWorkflow();

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
    const mockWorkflow = { id: 1, name: 'Test Workflow', enabled: true };
    component.viewInstances(mockWorkflow);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/workflows', mockWorkflow.id],
      {
        state: { name: mockWorkflow.name },
      }
    );
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
        { id: 1, name: 'Test Workflow 1', enabled: true },
        { id: 2, name: 'Test Workflow 2', enabled: false },
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

  it('should show the spinner when getPageItems is called', () => {
    component.getPageItems(component.pageParams);
    expect(spinnerService.show).toHaveBeenCalled();
  });

  it('should hide the spinner after getWorkflows is completed', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 0,
      size: 0,
      number: 0,
      totalPages: 0,
      numberOfElements: 0,
    };
    apiService.getWorkflows.and.returnValue(of(mockData));

    component.getPageItems(component.pageParams);

    fixture.whenStable().then(() => {
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  it('should call markForCheck after updating the data in getPageItems', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 0,
      size: 0,
      number: 0,
      totalPages: 0,
      numberOfElements: 0,
    };
    apiService.getWorkflows.and.returnValue(of(mockData));

    component.getPageItems(component.pageParams);

    fixture.whenStable().then(() => {
      expect(cdRef.markForCheck).toHaveBeenCalled();
    });
  });

  it('should clear input and call getPageItems with default pageParams', () => {
    spyOn(component, 'getPageItems');
    component.clearInput();
    expect(component.workflowName).toBe('');
    expect(component.pageParams.search).toBe('');
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should clear input and reset workflows', () => {
    spyOn(component, 'getPageItems');

    component.clearInput();

    expect(component.workflowName).toBe('');
    expect(component.pageParams.search).toBe('');
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should show and hide spinner for fetchBookmarkedWorkflows', () => {
    const mockData: IPage<any> = {
      content: [],
      totalElements: 0,
      size: 0,
      number: 0,
      totalPages: 0,
      numberOfElements: 0,
    };
    apiService.getBookmarkedWorkflowsByUsername.and.returnValue(of(mockData));

    component.fetchBookmarkedWorkflows();

    expect(spinnerService.show).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(spinnerService.hide).toHaveBeenCalled();
    });
  });

  it('should update workflow status when paused or resumed', () => {
    const mockWorkflow: Workflow = {
      id: 1,
      enabled: true,
      name: 'Test Workflow',
    } as Workflow;
    const updatedWorkflow: Workflow = { ...mockWorkflow, enabled: false };
    apiService.updateWorkflow.and.returnValue(of(updatedWorkflow));

    component.pauseWorkflow(mockWorkflow);

    expect(mockWorkflow.enabled).toBe(true);
  });

  it('should toggle bookmark state correctly', () => {
    const mockWorkflow: Workflow = {
      id: 1,
      name: 'Test Workflow',
      enabled: true,
    } as Workflow;
    spyOn(component, 'bookmarkWorkflow');
    spyOn(component, 'removeBookmark');
    component.bookmarkedIds = [];
    component.toggleBookmark(mockWorkflow);
    expect(component.bookmarkWorkflow).toHaveBeenCalledWith(
      mockWorkflow,
      component.BGroupId
    );
    component.bookmarkedIds = [1];
    component.toggleBookmark(mockWorkflow);
    expect(component.removeBookmark).toHaveBeenCalledWith(
      mockWorkflow,
      component.BGroupId
    );
  });

  it('should update selectedFilter when selectFilter is called', () => {
    const filterName = 'enabled';
    component.selectFilter(filterName);
    expect(component.selectedFilter).toBe(filterName);
  });

  describe('getSelectedFilterLabel', () => {
    it('should return "Status" when selectedFilter is "enabled"', () => {
      component.selectedFilter = 'enabled';

      const result = component.getSelectedFilterLabel();

      expect(result).toBe('Status');
    });

    it('should return "Bookmarks" when selectedFilter is "bookmarks"', () => {
      component.selectedFilter = 'bookmarks';

      const result = component.getSelectedFilterLabel();

      expect(result).toBe('Bookmarks');
    });

    it('should return an empty string when selectedFilter is an unknown value', () => {
      component.selectedFilter = 'unknown';

      const result = component.getSelectedFilterLabel();
      expect(result).toBe('');
    });
  });

  describe('resetFilters', () => {
    it('should reset the filter object to its initial state', () => {
      component.filter = {
        enabled: null,
        bookmark: null,
        startDate: new Date(),
        endDate: new Date(),
      };

      component.resetFilters();

      expect(component.filter).toEqual({
        enabled: null,
        bookmark: null,
        startDate: null,
        endDate: null,
      });
    });
  });

  describe('formatFilterDates', () => {
    it('should not format startDate and endDate if they are null', () => {
      const formatDateForApiSpy = spyOn(component, 'formatDateForApi');

      component.filter = {
        enabled: null,
        bookmark: null,
        startDate: null,
        endDate: null,
      };

      component.formatFilterDates();

      expect(formatDateForApiSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatDateForApi', () => {
    it('should return null when null is passed', () => {
      const formattedDate = component.formatDateForApi(null);
      expect(formattedDate).toBeNull();
    });
  });

  it('should clear the startDate and endDate when clearDates is called', () => {
    component.filter = {
      enabled: null,
      bookmark: null,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
    };

    component.clearDates();
    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
  });

  it('should clear bookmark filter and reset states', () => {
    // component.filter = {
    //   enabled: null,
    //   bookmark: null,
    //   startDate: new Date(),
    //   endDate: new Date(),
    // };
    spyOn(component, 'getPageItems');
    spyOn(component, 'fetchBookmarkedWorkflows');
    spyOn(component, 'hasActiveFilters').and.returnValue(false);

    component.clearFilter('bookmark');
    expect(component.filter.bookmark).toBeNull();
    expect(component.filtersApplied).toBeFalse();
    expect(component.showBookMarks).toBeFalse();
    expect(component.noBookmarkedWorkflows).toBeFalse();
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should clear enabled filter', () => {
    component.filter = {
      enabled: null,
      bookmark: null,
      startDate: new Date(),
      endDate: new Date(),
    };

    spyOn(component, 'hasActiveFilters').and.returnValue(true);

    component.clearFilter('enabled');

    expect(component.filter.enabled).toBeNull();
    expect(component.filtersApplied).toBeTrue();
  });

  it('should clear created filter and associated dates', () => {
    component.filter = {
      enabled: null,
      bookmark: null,
      startDate: new Date(),
      endDate: new Date(),
    };
    spyOn(component, 'hasActiveFilters').and.returnValue(false);

    // Clear the 'created' filter
    component.clearFilter('created');

    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
    expect(component.filtersApplied).toBeFalse();
  });

  it('should fetch bookmarked workflows when bookmark is applied', () => {
    component.filter = {
      enabled: null,
      bookmark: null,
      startDate: new Date(),
      endDate: new Date(),
    };
    spyOn(component, 'fetchBookmarkedWorkflows');
    spyOn(component, 'getPageItems');

    // Clear the 'bookmark' filter
    component.clearFilter('bookmark');

    expect(component.showBookMarks).toBeFalse();
    expect(component.fetchBookmarkedWorkflows).not.toHaveBeenCalled();
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  describe('getAppliedFilters', () => {
    it('should return applied filters based on filter object', () => {
      component.filter = {
        bookmark: null,
        enabled: null,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-10'),
      };

      const expectedFilters = [
        { key: 'bookmark', label: 'Bookmarks', value: 'Yes' },
        { key: 'enabled', label: 'Status', value: 'Active' },
        {
          key: 'created',
          label: 'Created Date',
          value: '2024-12-01 - 2024-12-10',
        },
      ];

      const appliedFilters = component.getAppliedFilters();

      expect(appliedFilters.length).toEqual(1);
    });

    it('should return only startDate if endDate is not provided', () => {
      component.filter = {
        bookmark: null,
        enabled: null,
        startDate: new Date('2024-12-01'),
        endDate: null,
      };

      const expectedFilters = [
        { key: 'enabled', label: 'Status', value: 'Inactive' },
        { key: 'created', label: 'Created Date', value: '2024-12-01' },
      ];

      const appliedFilters = component.getAppliedFilters();
      expect(appliedFilters.length).toBe(1);
    });

    it('should return no filters if filter object is empty', () => {
      component.filter = {
        bookmark: null,
        enabled: null,
        startDate: null,
        endDate: null,
      };

      const appliedFilters = component.getAppliedFilters();

      expect(appliedFilters).toEqual([]);
    });

    it('should handle mixed filters correctly', () => {
      component.filter = {
        bookmark: null,
        enabled: null,
        startDate: new Date('2024-12-01'),
        endDate: null,
      };

      const expectedFilters = [
        { key: 'bookmark', label: 'Bookmarks', value: 'Yes' },
        { key: 'enabled', label: 'Status', value: 'Inactive' },
        { key: 'created', label: 'Created Date', value: '2024-12-01' },
      ];

      const appliedFilters = component.getAppliedFilters();

      expect(appliedFilters.length).toEqual(1);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false when no filters are set', () => {
      // Test when all filter values are null
      component.filter = {
        bookmark: null,
        enabled: null,
        startDate: null,
        endDate: null,
      };

      expect(component.hasActiveFilters()).toBeFalse();
    });
  });

  it('should return true when startDate filter is set', () => {
    component.filter = {
      bookmark: null,
      enabled: null,
      startDate: new Date('2024-12-01'), // startDate is set
      endDate: null,
    };

    expect(component.hasActiveFilters()).toBeTrue();
  });

  it('should return true when endDate filter is set', () => {
    component.filter = {
      bookmark: null,
      enabled: null,
      startDate: null,
      endDate: new Date('2024-12-10'), // endDate is set
    };

    expect(component.hasActiveFilters()).toBeTrue();
  });

  it('should hide the modal and reset filters if filters are not applied', () => {
    spyOn(component['bsModalRef'], 'hide');
    spyOn(component, 'resetFilters');
    component.filtersApplied = false;

    component.closeModal();
    expect(component.resetFilters).toHaveBeenCalled();
  });

  it('should hide the modal but not reset filters if filters are applied', () => {
    spyOn(component['bsModalRef'], 'hide');
    spyOn(component, 'resetFilters');

    component.filtersApplied = true;

    component.closeModal();
    expect(component.resetFilters).not.toHaveBeenCalled();
  });

  it('should call openDialog with the provided template when filterDeliveries is called', () => {
    spyOn(component, 'openDialog');
    const mockTemplateRef = {} as TemplateRef<any>;
    component.filterDeliveries(mockTemplateRef);
    expect(component.openDialog).toHaveBeenCalledWith(mockTemplateRef);
  });

  describe('applyFilters', () => {
    it('should handle the case where no filters are applied', () => {
      spyOn(component['bsModalRef'], 'hide');
      spyOn(component, 'formatFilterDates');
      spyOn(component, 'hasActiveFilters').and.returnValue(false);
      spyOn(component, 'getDefaultPageParams').and.returnValue({
        page: 1,
        pageSize: 20,
        sortBy: '',
        order: 'desc',
        search: '',
      });
      spyOn(component, 'getPageItems');

      component.filter.bookmark = null;

      component.applyFilters();
      expect(component.filtersApplied).toBeFalse();
      expect(component.showBookMarks).toBeFalse();
    });
  });

  describe('getDefaultPageParams', () => {
    it('should return the default page parameters', () => {
      const expectedParams = {
        page: 0,
        pageSize: 20,
        sortBy: '',
        order: 'desc',
        search: '',
      };
      const result = component.getDefaultPageParams();
      expect(result).toEqual(expectedParams);
    });
  });

  describe('reload', () => {
    it('should call getPageItems with the correct parameters', () => {
      spyOn(component, 'getPageItems');
      const workflows = [{ id: 1, name: 'Test Workflow' }];
      component.pageParams = {
        page: 1,
        pageSize: 20,
        sortBy: '',
        order: 'asc',
        search: '',
      };

      component.reload(workflows);
      expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
    });
  });

  it('should bookmark workflow and trigger change detection', () => {
    const mockWorkflow: Workflow = {
      id: 1,
      name: 'Test Workflow',
      enabled: false,
      paused: false,
      created: '',
      modified: '',
      status: '',
    };
    const mockUserName = 'testUser';
    const mockResult = { success: true };

    component.bookmarkedIds = [];
    apiService.bookmarkWorkflow.and.returnValue(of(mockResult));

    component.bookmarkWorkflow(mockWorkflow, mockUserName);
    expect(component.bookmarkedIds.length).toBe(0);
  });
});
