import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeItemLabelManagementComponent } from './trade-item-label-management.component';

describe('TradeItemLabelManagementComponent', () => {
  let component: TradeItemLabelManagementComponent;
  let fixture: ComponentFixture<TradeItemLabelManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeItemLabelManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeItemLabelManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
