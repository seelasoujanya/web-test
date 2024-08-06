import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowHistoryComponent } from './workflow-history.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

describe('WorkflowHistoryComponent', () => {
  let component: WorkflowHistoryComponent;
  let fixture: ComponentFixture<WorkflowHistoryComponent>;
  let apiService: ApiService;
  let router: Router;
  let cdRef: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WorkflowHistoryComponent,
        CommonModule,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        ApiService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '123' } },
            getCurrentNavigation: () => ({
              extras: { state: { name: 'Test Workflow' } },
            }),
          },
        },
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: jasmine.createSpy('markForCheck') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowHistoryComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    cdRef = TestBed.inject(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getPageItems on ngOnInit', () => {
    spyOn(component, 'getPageItems');
    component.ngOnInit();
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should complete destroyed$ on ngOnDestroy', () => {
    spyOn(component['destroyed$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroyed$'].complete).toHaveBeenCalled();
  });

  it('should update pageParams and call getPageItems on onPage', () => {
    spyOn(component, 'getPageItems');
    component.onPage(2);
    expect(component['pageParams'].page).toBe(1);
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should navigate to /workflows on backToWorkflows', () => {
    spyOn(router, 'navigate');
    component.backToWorkflows();
    expect(router.navigate).toHaveBeenCalledWith(['/workflows']);
  });

  it('should update pageParams and call getPageItems on sortColumn', () => {
    spyOn(component, 'getPageItems');
    component.sortColumn({ sortBy: 'Queued On', order: 'desc' });
    expect(component['pageParams'].sortBy).toBe('created');
    expect(component['pageParams'].order).toBe('desc');
    expect(component.getPageItems).toHaveBeenCalledWith(
      component['pageParams']
    );
  });

  it('should navigate to workflow instance details on viewInstanceDetails', () => {
    spyOn(router, 'navigate');
    component.viewInstanceDetails({ id: '456' });
    expect(router.navigate).toHaveBeenCalledWith(['/workflowinstance', '456']);
  });
});
