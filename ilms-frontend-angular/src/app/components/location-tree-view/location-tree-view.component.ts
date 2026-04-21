import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';

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
    .selected { background: rgba(var(--primary-main-rgb), 0.08); }
    .node-content { cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; }
    .node-name { font-weight: 500; font-size: 0.875rem; }
    .node-type { font-size: 0.75rem; color: var(--text-secondary); }
    .expand-btn { width: 32px; height: 32px; line-height: 32px; margin-right: 4px; }
    .no-children { font-size: 0.75rem; color: var(--text-secondary); font-style: italic; margin: 4px 0; }
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

  constructor(private apiService: ApiService) {}

  async handleExpand(event: MouseEvent) {
    event.stopPropagation();
    if (this.expanded) {
      this.expanded = false;
    } else {
      this.expanded = true;
      if (!this.loaded) {
        this.loading = true;
        try {
          this.children = await this.apiService.getChildren(this.node.id);
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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRoots();
  }

  async loadRoots() {
    try {
      this.roots = await this.apiService.getRoots();
    } catch (e) {
      console.error(e);
    }
  }
}
