import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelDesignerComponent } from './label-designer.component';

describe('LabelDesignerComponent', () => {
  let component: LabelDesignerComponent;
  let fixture: ComponentFixture<LabelDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelDesignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
