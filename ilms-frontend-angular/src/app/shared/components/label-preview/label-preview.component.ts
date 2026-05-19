import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as bwipjs from 'bwip-js';

export interface LabelElement {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  src?: string;
}

@Component({
  selector: 'app-label-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label-preview.component.html',
  styleUrl: './label-preview.component.scss'
})
export class LabelPreviewComponent implements OnChanges {
  @Input() width: number = 100; // in mm
  @Input() height: number = 150; // in mm
  @Input() elements: LabelElement[] = [];
  @Input() data: any = {};
  @Input() scale: number = 3.78; // 1mm = 3.78px

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['elements'] || changes['data']) {
      // Logic for rendering can go here if we use a Canvas for the whole label
      // But for now, we use DOM + BWIP-JS for specific barcodes.
      setTimeout(() => this.renderBarcodes(), 0);
    }
  }

  private renderBarcodes() {
    this.elements.forEach(el => {
      if (el.type === 'barcode' || el.type === 'qr') {
        const canvasId = `bwip-canvas-${el.id}`;
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
          const content = this.substitute(el.content);
          try {
            bwipjs.toCanvas(canvas, {
              bcid: el.type === 'qr' ? 'qrcode' : 'code128',
              text: content || '000000',
              scale: 2,
              height: el.type === 'barcode' ? 10 : undefined, // BWIP-JS height is in units
              includetext: el.type === 'barcode',
              textxalign: 'center',
            });
          } catch (e) {
            console.error('BWIP-JS Error:', e);
          }
        }
      }
    });
  }

  substitute(text: string): string {
    if (!text) return '';
    return text.replace(/\{([^}]+)\}/g, (match, key) => {
      return this.data[key] !== undefined ? this.data[key] : match;
    });
  }

  getElementStyle(el: LabelElement) {
    return {
      'position': 'absolute',
      'left': (el.x * this.scale) + 'px',
      'top': (el.y * this.scale) + 'px',
      'width': (el.width * this.scale) + 'px',
      'height': (el.height * this.scale) + 'px',
      'font-size': (el.fontSize ? el.fontSize * this.scale / 3.78 : 12) + 'px',
      'font-weight': el.fontWeight || 'normal',
      'font-style': el.fontStyle || 'normal',
      'text-decoration': el.textDecoration || 'none',
      'overflow': 'hidden',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center'
    };
  }
}
