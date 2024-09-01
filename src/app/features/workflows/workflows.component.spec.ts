import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsComponent } from './workflows.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { of } from 'rxjs';
import { Workflow } from 'src/app/core/models/workflow.model';

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

  it('should call getPageItems with updated search parameter', () => {
    const searchTerm = 'test workflow';
    component.workflowName = searchTerm;
    spyOn(component, 'getPageItems');

    component.searchWorkflow();

    expect(component.pageParams.search).toBe(searchTerm);
    expect(component.getPageItems).toHaveBeenCalledWith(component.pageParams);
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
});
