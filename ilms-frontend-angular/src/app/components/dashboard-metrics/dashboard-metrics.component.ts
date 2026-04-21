import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatChipsModule
  ],
  templateUrl: './dashboard-metrics.component.html',
  styleUrls: ['./dashboard-metrics.component.scss']
})
export class DashboardMetricsComponent implements OnInit {
  loading = true;
  metrics: any = null;
  stages: any[] = [];
  alerts: any[] = [];
  recentEvents: any[] = [];
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading = true;
    this.error = null;
    try {
      const [metricsData, stagesData, alertsData, eventsData] = await Promise.all([
        this.apiService.getMetrics(),
        this.apiService.getInventoryByStage(),
        this.apiService.getAlerts(10),
        this.apiService.getRecentEvents(10)
      ]);

      this.metrics = metricsData;
      this.stages = stagesData || [];
      this.alerts = alertsData || [];
      this.recentEvents = eventsData || [];
    } catch (e) {
      console.error('Failed to load dashboard data', e);
      this.error = 'Failed to load dashboard data. Some widgets may show partial information.';
    } finally {
      this.loading = false;
    }
  }

  getAlertConfig(severity: string) {
    const config: any = {
      ERROR: { color: 'error', icon: 'error' },
      WARNING: { color: 'warning', icon: 'warning' },
      INFO: { color: 'info', icon: 'schedule' }
    };
    return config[severity] || config.INFO;
  }

  getStageColor(stage: string) {
    const colors: any = {
      PRE_INVENTORY: '#ff9800',
      ACTIVE: '#4caf50',
      PACKED: '#2196f3',
      SHIPPED: '#9c27b0',
      DELIVERED: '#00bcd4'
    };
    return colors[stage] || '#999';
  }
}
