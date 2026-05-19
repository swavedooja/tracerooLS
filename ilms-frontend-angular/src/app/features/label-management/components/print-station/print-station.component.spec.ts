import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintStationComponent } from './print-station.component';

describe('PrintStationComponent', () => {
  let component: PrintStationComponent;
  let fixture: ComponentFixture<PrintStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintStationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
