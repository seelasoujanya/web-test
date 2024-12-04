import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  DeliveryTypeStats,
  StatsDTO,
} from 'src/app/core/models/workflowinstance.model';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-workflow-statistics-view',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './workflow-statistics-view.component.html',
  styleUrl: './workflow-statistics-view.component.scss',
})
export class WorkflowStatisticsViewComponent {
  successfulCounts: number[] = [];
  failedCounts: number[] = [];

  stats: StatsDTO | null = null;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels = ['Successful', 'Failures'];

  public pieChartLegend = true;
  public pieChartPlugins = [];

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
  };
  public barChartLabels: string[] = [
    'FULL DELIVERY',
    'DATA ONLY',
    'PACKSHOT',
    'COVER ART',
    'SCREENGRAB',
    'INSERT',
    'TAKEDOWN',
    'NONE',
  ];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initialWorkflowsStatistics();
  }

  initialWorkflowsStatistics() {
    const woflowId = this.route.snapshot.params['id'];
    this.apiService.getWorkflowsStatistics(woflowId).subscribe(
      data => {
        this.stats = data;
        this.updateBarChartData(data.deliveryTypeStats);
      },
      error => {
        console.error('Error fetching workflow stats', error);
      }
    );
  }

  pieChartDatasets() {
    return [
      {
        data: [
          this.stats?.totalSuccessfulInstances,
          this.stats?.totalFailedInstances,
        ],
        backgroundColor: ['#4caf50', '#dc3545'],
      },
    ];
  }

  private updateBarChartData(deliveryTypeStats: {
    [key: string]: DeliveryTypeStats;
  }) {
    const labelMap: { [key: string]: { successful: number; failed: number } } =
      {
        'FULL DELIVERY': { successful: 0, failed: 0 },
        'DATA ONLY': { successful: 0, failed: 0 },
        PACKSHOT: { successful: 0, failed: 0 },
        'COVER ART': { successful: 0, failed: 0 },
        SCREENGRAB: { successful: 0, failed: 0 },
        INSERT: { successful: 0, failed: 0 },
        TAKEDOWN: { successful: 0, failed: 0 },
        NONE: { successful: 0, failed: 0 },
      };

    const keyMapping: { [key: string]: string } = {
      FULL_DELIVERY: 'FULL DELIVERY',
      DATA_ONLY: 'DATA ONLY',
      PACKSHOT: 'PACKSHOT',
      COVER_ART: 'COVER ART',
      SCREENGRAB: 'SCREENGRAB',
      INSERT: 'INSERT',
      TAKE_DOWN: 'TAKEDOWN',
      NONE: 'NONE',
    };

    for (const key in deliveryTypeStats) {
      if (deliveryTypeStats.hasOwnProperty(key)) {
        const stats = deliveryTypeStats[key];
        const label = keyMapping[key];
        if (label) {
          labelMap[label].successful += stats.successful;
          labelMap[label].failed += stats.failures;
        }
      }
    }

    this.successfulCounts = this.barChartLabels.map(
      label => labelMap[label]?.successful || 0
    );
    this.failedCounts = this.barChartLabels.map(
      label => labelMap[label]?.failed || 0
    );
  }

  datasets() {
    return [
      {
        data: this.successfulCounts,
        label: 'Successful',
        backgroundColor: '#4caf50',
      },
      {
        data: this.failedCounts,
        label: 'Failures',
        backgroundColor: '#dc3545',
      },
    ];
  }
}
