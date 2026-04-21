import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAvatarModule } from '@angular/material/avatar';

@Component({
  selector: 'app-material-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './material-detail-card.component.html',
  styleUrl: './material-detail-card.component.scss'
})
export class MaterialDetailCardComponent {
  @Input() material: any;
  @Input() images: any[] = [];

  get mainImage(): string {
    return this.images.find(img => img.type === 'MAIN')?.url || 
           this.images[0]?.url || 
           'https://via.placeholder.com/600x400?text=Pharma+Material';
  }
}
