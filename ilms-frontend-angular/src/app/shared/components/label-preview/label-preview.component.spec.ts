import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelPreviewComponent } from './label-preview.component';

describe('LabelPreviewComponent', () => {
  let component: LabelPreviewComponent;
  let fixture: ComponentFixture<LabelPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
