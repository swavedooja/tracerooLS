import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { LabelService } from '../../services/label.service';

interface LabelElement {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: string;
}

@Component({
  selector: 'app-label-designer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './label-designer.component.html',
  styleUrl: './label-designer.component.scss'
})
export class LabelDesignerComponent implements OnInit {
  id: string | null = null;
  template: any = {
    name: 'New Template',
    type: 'ITEM',
    width: 100,
    height: 150,
    status: 'DRAFT',
    canvas_design: []
  };

  elements: LabelElement[] = [];
  selectedId: string | null = null;

  dynamicFields = [
    { label: 'Mat Code', value: '{materialCode}' },
    { label: 'Mat Name', value: '{materialName}' },
    { label: 'Batch', value: '{batchNumber}' },
    { label: 'Serial', value: '{serialNumber}' },
    { label: 'Expiry', value: '{expiryDate}' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labelService: LabelService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadTemplate();
    }
  }

  async loadTemplate() {
    try {
      const data = await this.labelService.getLabelTemplate(this.id!);
      this.template = data;
      this.elements = data.canvas_design || [];
    } catch (e) {
      console.error(e);
    }
  }

  addElement(type: 'text' | 'barcode' | 'qr' | 'image') {
    const newEl: LabelElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 10,
      y: 10,
      width: type === 'text' ? 80 : 40,
      height: type === 'text' ? 10 : 40,
      content: type === 'text' ? 'New Text' : '{materialCode}',
      fontSize: 12
    };
    this.elements = [...this.elements, newEl];
    this.selectedId = newEl.id;
  }

  get selectedElement() {
    return this.elements.find(el => el.id === this.selectedId);
  }

  updateElement(field: string, value: any) {
    this.elements = this.elements.map(el => 
      el.id === this.selectedId ? { ...el, [field]: value } : el
    );
  }

  removeElement(id: string) {
    this.elements = this.elements.filter(el => el.id !== id);
    if (this.selectedId === id) this.selectedId = null;
  }

  insertField(fieldValue: string) {
    if (this.selectedElement && this.selectedElement.type === 'text') {
      const current = this.selectedElement.content || '';
      this.updateElement('content', current + fieldValue);
    }
  }

  async save() {
    const payload = {
      ...this.template,
      canvas_design: this.elements
    };

    try {
      if (this.id) {
        await this.labelService.updateLabelTemplate(this.id, payload);
      } else {
        await this.labelService.createLabelTemplate(payload);
      }
      alert('Saved Successfully!');
      this.router.navigate(['/label-management/templates']);
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  }

  // MM to Pixel conversion for the SVG view
  mmToPx(mm: number) {
    return mm * 3.78;
  }
}
