import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-material-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './material-inventory.component.html',
  styleUrl: './material-inventory.component.scss'
})
export class MaterialInventoryComponent implements OnInit {
  inventory: any[] = [];
  filteredInventory: any[] = [];
  loading = false;
  searchQuery = '';
  showUnprintedOnly = false;
  selectedIds = new Set<string>();

  displayedColumns: string[] = ['select', 'serialNumber', 'materialDetails', 'batchNumber', 'qualityStatus', 'labelPrinted', 'location'];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadInventory();
  }

  async loadInventory() {
    this.loading = true;
    try {
      this.inventory = await this.apiService.getInventory();
      this.applyFilters();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    this.filteredInventory = this.inventory.filter(item => {
      const matchesSearch = 
        item.serialNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.materialName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesFilter = this.showUnprintedOnly ? item.labelPrinted === 'N' : true;
      
      return matchesSearch && matchesFilter;
    });
  }

  get passItems() {
    return this.filteredInventory.filter(item => item.qualityStatus === 'PASS');
  }

  isAllSelected() {
    const numSelected = this.selectedIds.size;
    const numRows = this.passItems.length;
    return numSelected === numRows && numRows > 0;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selectedIds.clear();
    } else {
      this.passItems.forEach(row => this.selectedIds.add(row.id));
    }
  }

  toggleRow(row: any) {
    if (row.qualityStatus !== 'PASS') return;
    if (this.selectedIds.has(row.id)) {
      this.selectedIds.delete(row.id);
    } else {
      this.selectedIds.add(row.id);
    }
  }

  selectByBatch(batch: string) {
    this.passItems
      .filter(item => item.batchNumber === batch)
      .forEach(item => this.selectedIds.add(item.id));
  }

  selectByProduct(productName: string) {
    this.passItems
      .filter(item => item.materialName === productName)
      .forEach(item => this.selectedIds.add(item.id));
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  get uniqueBatches() {
    return Array.from(new Set(this.passItems.map(i => i.batchNumber)));
  }

  get uniqueProducts() {
    return Array.from(new Set(this.passItems.map(i => i.materialName)));
  }

  handleBulkPrint() {
    if (this.selectedIds.size === 0) return;
    const selectedItems = this.inventory.filter(i => this.selectedIds.has(i.id));
    this.router.navigate(['/labels/trade-print'], { state: { preSelectedItems: selectedItems } });
  }
}
