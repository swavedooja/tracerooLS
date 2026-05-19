import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDetailCardComponent } from './material-detail-card.component';

describe('MaterialDetailCardComponent', () => {
  let component: MaterialDetailCardComponent;
  let fixture: ComponentFixture<MaterialDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialDetailCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
