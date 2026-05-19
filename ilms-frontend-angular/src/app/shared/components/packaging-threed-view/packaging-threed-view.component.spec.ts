import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagingThreedViewComponent } from './packaging-threed-view.component';

describe('PackagingThreedViewComponent', () => {
  let component: PackagingThreedViewComponent;
  let fixture: ComponentFixture<PackagingThreedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagingThreedViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagingThreedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
