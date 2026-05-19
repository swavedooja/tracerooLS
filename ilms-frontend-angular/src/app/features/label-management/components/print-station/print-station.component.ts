import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { LabelService } from '../../services/label.service';
import { LabelPreviewComponent } from '../../../../shared/components/label-preview/label-preview.component';
import { jsPDF } from 'jspdf';

interface OrderLineConfig {
  line: any;
  hierarchy: any | null;
  levels: any[];
  counts: { [levelId: string]: number };
  error?: string;
  needsSelection?: boolean;
  hierarchies?: any[];
}

@Component({
  selector: 'app-print-station',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    LabelPreviewComponent
  ],
  templateUrl: './print-station.component.html',
  styleUrl: './print-station.component.scss'
})
export class PrintStationComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  orders: any[] = [];
  selectedOrder: any = null;
  orderLines: any[] = [];
  lineConfigs: { [lineId: string]: OrderLineConfig } = {};
  
  loading = false;
  activeStep = 0;

  constructor(private labelService: LabelService, private router: Router) {}

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    this.loading = true;
    try {
      let data = await this.labelService.getPendingOrders();
      // Mock data if empty for demo
      if (!data || data.length === 0) {
        data = [
          { id: 'd1', order_number: 'SO-2024-001', customer_name: 'PharmaDist Inc.', created_at: new Date().toISOString(), status: 'PENDING' },
          { id: 'd2', order_number: 'SO-2024-002', customer_name: 'Metro Health Co.', created_at: new Date().toISOString(), status: 'PENDING' }
        ];
      }
      this.orders = data;
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  async onOrderSelect(order: any) {
    this.loading = true;
    this.selectedOrder = order;
    try {
      let lines = await this.labelService.getOrderLines(order.id);
      
      // Mock lines if empty
      if (!lines || lines.length === 0) {
        lines = [
          { id: 'l1', material_code: 'MAT-AMX', quantity: 100, uom: 'Units', material: { name: 'Amoxicillin 250mg' } },
          { id: 'l2', material_code: 'MAT-INS', quantity: 50, uom: 'Units', material: { name: 'Insulin Glargine' } }
        ];
      }
      this.orderLines = lines;

      // Initialize configs
      const configs: { [lineId: string]: OrderLineConfig } = {};
      for (const line of lines) {
        let hierarchies = await this.labelService.getHierarchies(line.material_code);
        
        if (hierarchies.length === 1) {
          const h = hierarchies[0];
          const levels = await this.labelService.getLevels(h.id);
          configs[line.id] = {
            line,
            hierarchy: h,
            levels: levels.sort((a: any, b: any) => a.level_order - b.level_order),
            counts: this.calculateDefaultCounts(line.quantity, levels)
          };
        } else if (hierarchies.length > 1) {
          configs[line.id] = { line, hierarchy: null, levels: [], counts: {}, needsSelection: true, hierarchies };
        } else {
          configs[line.id] = { line, hierarchy: null, levels: [], counts: {}, error: 'No hierarchy found' };
        }
      }
      this.lineConfigs = configs;
      setTimeout(() => this.stepper.next(), 0);
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  calculateDefaultCounts(qty: number, levels: any[]) {
    const counts: { [id: string]: number } = {};
    levels.forEach(lvl => {
      const cap = lvl.capacity || 1;
      counts[lvl.id] = Math.ceil(qty / cap);
    });
    return counts;
  }

  updateLevelCount(lineId: string, levelId: string, val: any) {
    if (this.lineConfigs[lineId]) {
      this.lineConfigs[lineId].counts[levelId] = parseInt(val) || 0;
    }
  }

  async selectHierarchyForLine(lineId: string, h: any) {
    this.loading = true;
    try {
      const levels = await this.labelService.getLevels(h.id);
      this.lineConfigs[lineId] = {
        ...this.lineConfigs[lineId],
        hierarchy: h,
        levels: levels.sort((a: any, b: any) => a.level_order - b.level_order),
        counts: this.calculateDefaultCounts(this.lineConfigs[lineId].line.quantity, levels),
        needsSelection: false
      };
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
  }

  getTotalLabelCount() {
    let total = 0;
    Object.values(this.lineConfigs).forEach(c => {
      Object.values(c.counts).forEach(count => total += count);
    });
    return total;
  }

  generatePDF() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('SHIPPING LABELS', 105, 20, { align: 'center' });
    
    let y = 40;
    Object.values(this.lineConfigs).forEach(config => {
      config.levels.forEach(lvl => {
        const count = config.counts[lvl.id] || 0;
        for (let i = 0; i < count; i++) {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          doc.setDrawColor(0);
          doc.rect(20, y, 170, 40);
          doc.setFontSize(12);
          doc.text(config.line.material?.name || config.line.material_code, 25, y + 10);
          doc.setFontSize(10);
          doc.text(`Level: ${lvl.level_name} | Order: ${this.selectedOrder.order_number}`, 25, y + 20);
          doc.text(`Serial: ${lvl.id.substr(0,8)}-${i+1}`, 25, y+30);
          y += 50;
        }
      });
    });

    doc.save(`Labels_${this.selectedOrder.order_number}.pdf`);
  }

  printAll() {
    window.print();
  }

  finish() {
    this.router.navigate(['/label-management/trade-item']);
  }

  // Helpers for Template
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  createRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  // Dummy Templates for Demo
  amxElements: any[] = [
    { id: '1', type: 'text', x: 10, y: 10, width: 80, height: 10, content: 'AMOXICILLIN 250mg', fontSize: 16, fontWeight: 'bold' },
    { id: '2', type: 'text', x: 10, y: 22, width: 80, height: 10, content: 'Code: {materialCode}', fontSize: 10 },
    { id: '3', type: 'barcode', x: 10, y: 40, width: 80, height: 30, content: '{materialCode}-{serialNumber}' },
    { id: '4', type: 'qr', x: 65, y: 80, width: 25, height: 25, content: '{serialNumber}' },
    { id: '5', type: 'text', x: 10, y: 80, width: 50, height: 10, content: 'BATCH: {batchNumber}', fontSize: 10 }
  ];

  insElements: any[] = [
    { id: '1', type: 'text', x: 10, y: 10, width: 80, height: 10, content: 'INSULIN GLARGINE', fontSize: 16, fontWeight: 'bold' },
    { id: '2', type: 'text', x: 10, y: 22, width: 80, height: 10, content: 'Cold Chain: 2-8°C', fontSize: 10, fontWeight: 'bold' },
    { id: '3', type: 'qr', x: 10, y: 40, width: 40, height: 40, content: 'INS-{serialNumber}' },
    { id: '4', type: 'barcode', x: 10, y: 90, width: 80, height: 20, content: '{materialCode}' }
  ];
}
