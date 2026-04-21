import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialInventoryComponent } from './material-inventory.component';

describe('MaterialInventoryComponent', () => {
  let component: MaterialInventoryComponent;
  let fixture: ComponentFixture<MaterialInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
