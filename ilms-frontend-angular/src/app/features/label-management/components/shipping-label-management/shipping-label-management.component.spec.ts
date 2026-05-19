import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingLabelManagementComponent } from './shipping-label-management.component';

describe('ShippingLabelManagementComponent', () => {
  let component: ShippingLabelManagementComponent;
  let fixture: ComponentFixture<ShippingLabelManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingLabelManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingLabelManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
