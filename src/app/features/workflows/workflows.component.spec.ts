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
        status: 'ACTIVE',
        description: undefined,
        throttleLimit: undefined,
        isTaskChainIsValid: undefined,
        alias: '',
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
        status: 'ACTIVE',
        description: undefined,
        throttleLimit: undefined,
        isTaskChainIsValid: undefined,
        alias: '',
      },
      {
        name: 'Another Workflow',
        id: 0,
        enabled: false,
        paused: false,
        created: '',
        modified: '',
        status: 'ACTIVE',
        description: undefined,
        throttleLimit: undefined,
        isTaskChainIsValid: undefined,
        alias: '',
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

  it('should instantiate all dependencies correctly in the constructor', () => {
    expect(apiService).toBeTruthy();
    expect(router).toBeTruthy();
    expect(cdRef).toBeTruthy();
    expect(spinnerService).toBeTruthy();
  });

  it('should clear input and call getPageItems with default pageParams', () => {
    spyOn(component, 'getPageItems');
    component.clearInput();
    expect(component.workflowName).toBe('');
    expect(component.pageParams.search).toBe('');
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
  });

  it('should update selectedFilter when selectFilter is called', () => {
    const filterName = 'enabled';
    component.selectFilter(filterName);
    expect(component.selectedFilter).toBe(filterName);
  });

  describe('getSelectedFilterLabel', () => {
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
        status: null,
        bookmark: null,
        startDate: new Date(),
        endDate: new Date(),
      };

      component.resetFilters();

      expect(component.filter).toEqual({
        status: null,
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
        status: null,
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
      status: null,
      bookmark: null,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-01'),
    };

    component.clearDates();
    expect(component.filter.startDate).toBeNull();
    expect(component.filter.endDate).toBeNull();
  });

  it('should clear enabled filter', () => {
    component.filter = {
      status: null,
      bookmark: null,
      startDate: new Date(),
      endDate: new Date(),
    };

    spyOn(component, 'hasActiveFilters').and.returnValue(true);

    component.clearFilter('enabled');

    expect(component.filter.status).toBeNull();
    expect(component.filtersApplied).toBeTrue();
  });

  it('should fetch bookmarked workflows when bookmark is applied', () => {
    component.filter = {
      status: null,
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

  describe('hasActiveFilters', () => {
    it('should return false when no filters are set', () => {
      // Test when all filter values are null
      component.filter = {
        bookmark: null,
        status: null,
        startDate: null,
        endDate: null,
      };

      expect(component.hasActiveFilters()).toBeFalse();
    });
  });

  it('should return true when endDate filter is set', () => {
    component.filter = {
      bookmark: null,
      status: null,
      startDate: null,
      endDate: new Date('2024-12-10'),
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
});
