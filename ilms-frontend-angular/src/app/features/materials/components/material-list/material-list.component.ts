import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialService } from '../../services/material.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MaterialDetailCardComponent } from '../../../../shared/components/material-detail-card/material-detail-card.component';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    MaterialDetailCardComponent
  ],
  templateUrl: './material-list.component.html',
  styleUrl: './material-list.component.scss'
})
export class MaterialListComponent implements OnInit {
  materials: any[] = [];
  search = '';
  displayedColumns: string[] = ['sku', 'type', 'group', 'uom', 'trackTrace', 'weight', 'actions'];
  viewMaterial: any = null;

  constructor(
    private materialService: MaterialService,
    public router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadMaterials();
  }

  async loadMaterials() {
    try {
      this.materials = await this.materialService.getMaterials();
    } catch (e) {
      console.error('Failed to load materials', e);
    }
  }

  get filteredMaterials() {
    return this.materials.filter(m => 
      m.name.toLowerCase().includes(this.search.toLowerCase()) || 
      m.code.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  onDelete(code: string) {
    if (confirm('Are you sure you want to delete this material?')) {
      this.materialService.removeMaterial(code).then(() => {
        this.loadMaterials();
      });
    }
  }

  onView(material: any, template: any) {
    this.viewMaterial = material;
    this.dialog.open(template, {
      width: '800px',
      maxWidth: '90vw',
      panelClass: 'material-dialog'
    });
  }

  navigateToNew() {
    this.router.navigate(['/materials/new']);
  }

  navigateToEdit(code: string) {
    this.router.navigate(['/materials', code], { queryParams: { mode: 'edit' } });
  }

  navigateToDetails(code: string) {
    this.dialog.closeAll();
    this.router.navigate(['/materials', code], { queryParams: { mode: 'view' } });
  }
}
