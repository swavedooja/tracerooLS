import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMetricsComponent } from './dashboard-metrics.component';

describe('DashboardMetricsComponent', () => {
  let component: DashboardMetricsComponent;
  let fixture: ComponentFixture<DashboardMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
