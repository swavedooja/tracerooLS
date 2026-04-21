import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  @Output() logout = new EventEmitter<void>();
  isDrawerOpen = false;

  menuItems = [
    { label: 'Operations Dashboard', icon: 'timeline', path: '/' },
    { label: 'Materials', icon: 'inventory_2', path: '/materials' },
    { label: 'Material Inventory', icon: 'storage', path: '/label-management/material-inventory' },
    { label: 'Generate Labels', icon: 'print', path: '/labels/generate' },
  ];

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  onLogout() {
    this.logout.emit();
  }
}
