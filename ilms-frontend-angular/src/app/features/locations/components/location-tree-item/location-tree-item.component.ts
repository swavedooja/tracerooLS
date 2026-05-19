import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-tree-item',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-list-item [style.padding-left.px]="level * 20" [class.selected]="selectedCode === node.code">
      <button mat-icon-button (click)="handleExpand($event)" class="expand-btn">
        <mat-spinner *ngIf="loading" [diameter]="16"></mat-spinner>
        <mat-icon *ngIf="!loading">{{ expanded ? 'expand_less' : 'chevron_right' }}</mat-icon>
      </button>
      <div mat-line class="node-content" (click)="handleSelect()">
        <span class="node-name">{{ node.name }}</span>
        <span class="node-type">{{ node.type }}</span>
      </div>
    </mat-list-item>
    <div *ngIf="expanded" class="children-container">
      <app-location-tree-item 
        *ngFor="let child of children" 
        [node]="child" 
        [onSelect]="onSelect" 
        [selectedCode]="selectedCode" 
        [level]="level + 1">
      </app-location-tree-item>
      <div *ngIf="loaded && children.length === 0" class="no-children" [style.padding-left.px]="(level + 1) * 20 + 40">
        No sub-locations
      </div>
    </div>
  `,
  styles: [`
    .selected { background: rgba(0, 0, 0, 0.04); }
    .node-content { cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; }
    .node-name { font-weight: 500; font-size: 0.875rem; }
    .node-type { font-size: 0.75rem; color: #666; }
    .expand-btn { width: 32px; height: 32px; line-height: 32px; margin-right: 4px; }
    .no-children { font-size: 0.75rem; color: #666; font-style: italic; margin: 4px 0; }
  `]
})
export class LocationTreeItemComponent {
  @Input() node: any;
  @Input() level = 0;
  @Input() selectedCode: string | null = null;
  @Input() onSelect!: (code: string) => void;

  expanded = false;
  loading = false;
  loaded = false;
  children: any[] = [];

  constructor(private locationService: LocationService) {}

  async handleExpand(event: MouseEvent) {
    event.stopPropagation();
    if (this.expanded) {
      this.expanded = false;
    } else {
      this.expanded = true;
      if (!this.loaded) {
        this.loading = true;
        try {
          this.children = await this.locationService.getChildren(this.node.id);
          this.loaded = true;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }
    }
  }

  handleSelect() {
    this.onSelect(this.node.code);
  }
}
