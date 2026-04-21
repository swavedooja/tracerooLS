import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridModule } from '@angular/material/grid';
import { MatPaperModule } from '@angular/material/paper';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../services/api.service';

const FMCG_PACKAGING_DATA = [
  { name: 'Standard Pallet', type: 'Pallet', dimensions: '1200mm x 1000mm x 1500mm', weight: '500kg' },
  { name: 'Euro Pallet', type: 'Pallet', dimensions: '1200mm x 800mm x 1500mm', weight: '400kg' },
  { name: '20ft Container', type: 'Container', dimensions: '5.9m x 2.35m x 2.39m', weight: 'Max 28,000kg' }
];

@Component({
  selector: 'app-shipping-label-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './shipping-label-management.component.html',
  styleUrl: './shipping-label-management.component.scss'
})
export class ShippingLabelManagementComponent implements OnInit {
  hierarchies: any[] = [];
  allHierarchies: any[] = [];
  selectedHierarchy: any = null;
  levels: any[] = [];
  
  searchQuery = '';
  productFilter = 'All';
  sortOrder = 'A-Z';

  FMCG_PACKAGING_DATA = FMCG_PACKAGING_DATA;

  dialogForm = {
    selectedBaseHierarchy: '',
    levelName: '',
    levelOrder: 1,
    levelCapacity: 10
  };

  constructor(private apiService: ApiService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadHierarchies();
  }

  async loadHierarchies() {
    try {
      const data = await this.apiService.getHierarchies();
      this.allHierarchies = data;
      this.hierarchies = data.filter(h => h.name.startsWith('Shipping -'));
      if (this.hierarchies.length > 0 && !this.selectedHierarchy) {
        this.selectHierarchy(this.hierarchies[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async selectHierarchy(h: any) {
    this.selectedHierarchy = h;
    if (h) {
      this.loadLevels(h.id);
    } else {
      this.levels = [];
    }
  }

  async loadLevels(hid: string) {
    try {
      this.levels = await this.apiService.getLevels(hid);
    } catch (e) {
      console.error(e);
    }
  }

  get filteredHierarchies() {
    return this.hierarchies
      .filter(h => h.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      .filter(h => this.productFilter === 'All' || h.name.includes(this.productFilter))
      .sort((a, b) => {
        if (this.sortOrder === 'A-Z') return a.name.localeCompare(b.name);
        if (this.sortOrder === 'Z-A') return b.name.localeCompare(a.name);
        return b.id - a.id;
      });
  }

  get baseHierarchies() {
    return this.allHierarchies.filter(h => !h.name.startsWith('Shipping -'));
  }

  getIconForType(typeStr: string) {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('pallet')) return 'layers';
    if (t.includes('container')) return 'local_shipping';
    return 'inventory';
  }

  openNewHierarchyDialog(template: any) {
    this.dialog.open(template, { width: '450px' });
  }

  openAddLevelDialog(template: any) {
    this.dialog.open(template, { width: '450px' });
  }

  async createHierarchy() {
    const hid = this.dialogForm.selectedBaseHierarchy;
    if (!hid) return;
    const baseH = this.allHierarchies.find(h => h.id === hid);
    if (!baseH) return;

    try {
      const h = await this.apiService.createHierarchy({ name: `Shipping - ${baseH.name}` });
      await this.apiService.createLevel({
        hierarchy_id: h.id,
        level_name: `Base: ${baseH.name}`,
        level_order: 1,
        capacity: 1
      });
      this.loadHierarchies();
      this.dialog.closeAll();
    } catch (e) {
      console.error(e);
    }
  }

  async saveLevel() {
    const f = this.dialogForm;
    if (!this.selectedHierarchy) return;

    try {
      await this.apiService.createLevel({
        hierarchy_id: this.selectedHierarchy.id,
        level_name: f.levelName,
        level_order: f.levelOrder,
        capacity: f.levelCapacity
      });
      this.loadLevels(this.selectedHierarchy.id);
      this.dialog.closeAll();
    } catch (e) {
      console.error(e);
    }
  }

  async deleteLevel(id: string) {
    if (confirm('Delete this level?')) {
      await this.apiService.deleteLevel(id);
      this.loadLevels(this.selectedHierarchy.id);
    }
  }

  getVisualizationData() {
    return [...this.levels].sort((a, b) => a.level_order - b.level_order);
  }
}
