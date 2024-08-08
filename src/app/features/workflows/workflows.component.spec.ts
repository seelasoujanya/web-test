import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsComponent } from './workflows.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/api.service';
import { Router } from '@angular/router';
import { IPage } from 'src/app/core/models/page.model';
import { Workflow } from 'src/app/core/models/workflow.model';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('WorkflowsComponent', () => {
  let component: WorkflowsComponent;
  let fixture: ComponentFixture<WorkflowsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;
  let cdRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflows',
      'updateWorkflow',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
    ]);

    await TestBed.configureTestingModule({
      imports: [WorkflowsComponent, HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: cdRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    cdRef = TestBed.inject(
      ChangeDetectorRef
    ) as jasmine.SpyObj<ChangeDetectorRef>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call router.navigate with correct parameters in viewInstances', () => {
    const mockData = { id: 1, name: 'Test Workflow' };
    component.viewInstances(mockData);
    expect(router.navigate).toHaveBeenCalledWith(['/workflows', mockData.id], {
      state: { name: mockData.name },
    });
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
});
