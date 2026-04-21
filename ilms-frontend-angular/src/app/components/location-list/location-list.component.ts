import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LocationTreeViewComponent } from '../location-tree-view/location-tree-view.component';
import { LocationFormComponent } from '../location-form/location-form.component';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    LocationTreeViewComponent,
    LocationFormComponent
  ],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss'
})
export class LocationListComponent {
  selectedCode: string | null = null;
  refreshTree = 0;

  handleSelect(code: string) {
    this.selectedCode = code;
  }

  handleSuccess() {
    this.refreshTree++;
    if (this.selectedCode === 'new') {
      this.selectedCode = null;
    }
  }

  handleDelete() {
    this.refreshTree++;
    this.selectedCode = null;
  }

  createNew() {
    this.selectedCode = 'new';
  }
}
