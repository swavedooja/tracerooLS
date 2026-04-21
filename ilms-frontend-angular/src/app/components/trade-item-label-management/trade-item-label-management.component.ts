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
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PackagingThreedViewComponent } from '../packaging-threed-view/packaging-threed-view.component';
import { LabelDesignerComponent } from '../label-designer/label-designer.component';

const PRODUCT_HIERARCHY_DATA: any = {
  "Amoxicillin 250mg": {
    skus: [
      { name: "Amoxicillin Blister (10 Caplets)", dimensions: "100mm x 50mm x 5mm", weight: "0.01kg", type: "Blister" },
      { name: "Amoxicillin Vial (10ml)", dimensions: "25mm x 25mm x 50mm", weight: "0.05kg", type: "Vial" }
    ],
    packagingTypes: ["Standard Pharma Carton", "Institutional Bulk Pack", "Global Export Case"]
  },
  "Insulin Glargine": {
    skus: [
      { name: "Insulin Pre-filled Pen (3ml)", dimensions: "15mm x 15mm x 160mm", weight: "0.08kg", type: "Syringe" }
    ],
    packagingTypes: ["Insulated Cold-Chain Case", "Standard Retail Box"]
  },
  "mRNA Vaccine": {
    skus: [
      { name: "Single Dose Vial (2ml)", dimensions: "12mm x 12mm x 45mm", weight: "0.02kg", type: "Vial" },
      { name: "Multi Dose Vial (10ml)", dimensions: "25mm x 25mm x 55mm", weight: "0.06kg", type: "Vial" }
    ],
    packagingTypes: ["Ultra-Cold Shipper", "Ambient Buffer Box"]
  }
};

const PHARMA_PACKAGING_DATA = [
  { name: 'Amoxicillin Vial (10ml)', type: 'Vial', dimensions: '25mm x 25mm x 50mm', weight: '0.05kg' },
  { name: 'Sterile Ampoule (2ml)', type: 'Ampoule', dimensions: '12mm x 12mm x 60mm', weight: '0.02kg' },
  { name: 'Insulin Pen (3ml)', type: 'Syringe', dimensions: '15mm x 15mm x 160mm', weight: '0.08kg' },
  { name: 'Blister Pack (10 Caplets)', type: 'Blister', dimensions: '100mm x 50mm x 5mm', weight: '0.01kg' },
  { name: 'Secondary Folding Box', type: 'Box', dimensions: '120mm x 60mm x 40mm', weight: '0.15kg' },
  { name: 'Master Shipper Case (50 Units)', type: 'Carton', dimensions: '400mm x 300mm x 250mm', weight: '8.5kg' }
];

@Component({
  selector: 'app-trade-item-label-management',
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
    MatDividerModule,
    PackagingThreedViewComponent
  ],
  templateUrl: './trade-item-label-management.component.html',
  styleUrl: './trade-item-label-management.component.scss'
})
export class TradeItemLabelManagementComponent implements OnInit {
  hierarchies: any[] = [];
  selectedHierarchy: any = null;
  levels: any[] = [];
  
  searchQuery = '';
  productFilter = 'All';
  sortOrder = 'A-Z';

  // State for components used as templates
  PRODUCT_HIERARCHY_DATA = PRODUCT_HIERARCHY_DATA;
  PHARMA_PACKAGING_DATA = PHARMA_PACKAGING_DATA;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHierarchies();
  }

  async loadHierarchies() {
    try {
      const data = await this.apiService.getHierarchies();
      this.hierarchies = data.filter(h => !h.name.startsWith('Shipping -'));
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

  get products() {
    return Object.keys(PRODUCT_HIERARCHY_DATA);
  }

  get skusForSelectedProduct() {
    // This would be used in a dialog component or template-driven form
    return [];
  }

  // Icon mapping helper
  getIconForType(typeStr: string) {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('vial') || t.includes('ampoule')) return 'local_drink';
    if (t.includes('tablet') || t.includes('box')) return 'inventory';
    if (t.includes('pallet')) return 'layers';
    return 'inventory';
  }

  // Placeholder for complex actions
  async openNewHierarchyDialog(template: any) {
    const dialogRef = this.dialog.open(template, { width: '450px' });
  }

  async openAddLevelDialog(template: any) {
    this.dialog.open(template, { width: '450px' });
  }

  async deleteLevel(id: string) {
    if (confirm('Delete this level?')) {
      await this.apiService.deleteLevel(id);
      this.loadLevels(this.selectedHierarchy.id);
    }
  }

  inferShape(name: string) {
    const n = (name || '').toLowerCase();
    if (n.includes('pallet')) return 'Pallet';
    if (n.includes('case') || n.includes('carton')) return 'Carton';
    if (n.includes('vial') || n.includes('bottle')) return 'Bottle';
    return 'Box';
  }

  getThreeDLevels() {
    return this.levels.map(l => ({
      levelIndex: l.level_order,
      levelName: l.level_name?.split(' (')[0] || `Level ${l.level_order}`,
      containedQuantity: l.capacity || 1,
      shapeType: this.inferShape(l.level_name)
    })).sort((a, b) => a.levelIndex - b.levelIndex);
  }

  // Form State for Dialogs (Simplified for Template use)
  dialogForm = {
    selectedProduct: '',
    selectedSku: '',
    selectedPackagingType: '',
    levelName: '',
    levelOrder: 1,
    levelCapacity: 10,
    gtin: ''
  };

  async createHierarchy() {
    const f = this.dialogForm;
    if (!f.selectedProduct || !f.selectedSku) return;

    const name = f.selectedPackagingType 
      ? `${f.selectedProduct} - ${f.selectedSku} - ${f.selectedPackagingType}`
      : `${f.selectedProduct} - ${f.selectedSku}`;

    try {
      const h = await this.apiService.createHierarchy({ name });
      
      // Auto-create levels like in React
      await this.apiService.createLevel({
        hierarchy_id: h.id,
        level_name: f.selectedSku,
        level_order: 1,
        capacity: 1
      });

      if (f.selectedPackagingType) {
        await this.apiService.createLevel({
          hierarchy_id: h.id,
          level_name: f.selectedPackagingType,
          level_order: 2,
          capacity: 10
        });
      }

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
        level_name: f.gtin ? `${f.levelName} (GTIN: ${f.gtin})` : f.levelName,
        level_order: f.levelOrder,
        capacity: f.levelCapacity
      });
      this.loadLevels(this.selectedHierarchy.id);
      this.dialog.closeAll();
    } catch (e) {
      console.error(e);
    }
  }
}
