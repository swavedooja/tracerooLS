import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationTreeViewComponent } from './location-tree-view.component';

describe('LocationTreeViewComponent', () => {
  let component: LocationTreeViewComponent;
  let fixture: ComponentFixture<LocationTreeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationTreeViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
