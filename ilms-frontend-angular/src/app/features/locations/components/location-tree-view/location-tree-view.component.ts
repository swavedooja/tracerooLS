import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { LocationService } from '../../services/location.service';
import { LocationTreeItemComponent } from '../location-tree-item/location-tree-item.component';

@Component({
  selector: 'app-location-tree-view',
  standalone: true,
  imports: [CommonModule, MatListModule, LocationTreeItemComponent],
  template: `
    <mat-list>
      <app-location-tree-item 
        *ngFor="let root of roots" 
        [node]="root" 
        [onSelect]="handleSelectBound" 
        [selectedCode]="selectedCode" 
        [level]="0">
      </app-location-tree-item>
    </mat-list>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class LocationTreeViewComponent implements OnInit {
  @Input() selectedCode: string | null = null;
  @Output() select = new EventEmitter<string>();

  roots: any[] = [];
  handleSelectBound = (code: string) => this.select.emit(code);

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    this.loadRoots();
  }

  async loadRoots() {
    try {
      this.roots = await this.locationService.getRoots();
    } catch (e) {
      console.error(e);
    }
  }
}
