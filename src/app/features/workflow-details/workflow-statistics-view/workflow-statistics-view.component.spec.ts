import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkflowStatisticsViewComponent } from './workflow-statistics-view.component';
import { ChartOptions } from 'chart.js';
import { StatsDTO } from 'src/app/core/models/workflowinstance.model';

describe('WorkflowStatisticsViewComponent', () => {
  let component: WorkflowStatisticsViewComponent;
  let fixture: ComponentFixture<WorkflowStatisticsViewComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getWorkflowsStatistics',
    ]);

    await TestBed.configureTestingModule({
      imports: [WorkflowStatisticsViewComponent], // Import standalone component
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '1' } },
          },
        },
      ],
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(WorkflowStatisticsViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct pieChartDatasets', () => {
    component.stats = {
      totalSuccessfulInstances: 10,
      totalFailedInstances: 5,
      deliveryTypeStats: {},
    } as any;

    const datasets = component.pieChartDatasets();
    expect(datasets).toEqual([
      {
        data: [10, 5],
        backgroundColor: ['#4caf50', '#dc3545'],
      },
    ]);
  });

  it('should handle error when fetching workflow stats', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    apiService.getWorkflowsStatistics.and.returnValue(
      throwError('Error fetching stats')
    );
    component.initialWorkflowsStatistics();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching workflow stats',
      'Error fetching stats'
    );
  });

  it('should call initialWorkflowsStatistics on init', () => {
    const spy = spyOn(component, 'initialWorkflowsStatistics');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should return correct datasets for bar chart', () => {
    const datasets = component.datasets();
    expect(datasets).toEqual([
      {
        data: component.successfulCounts,
        label: 'Successful',
        backgroundColor: '#4caf50',
      },
      {
        data: component.failedCounts,
        label: 'Failures',
        backgroundColor: '#dc3545',
      },
    ]);
  });

  it('should call updateBarChartData with correct data on successful API call', () => {
    const mockData = {
      totalSuccessfulInstances: 10,
      totalFailedInstances: 5,
      deliveryTypeStats: { FULL_DELIVERY: { successful: 5, failures: 1 } },
    } as StatsDTO;

    apiService.getWorkflowsStatistics.and.returnValue(of(mockData));
    component.initialWorkflowsStatistics();
    expect(component.stats).toEqual(mockData);
  });
});
