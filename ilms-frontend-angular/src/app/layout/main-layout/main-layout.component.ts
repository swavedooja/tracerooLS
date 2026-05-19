import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-nav-bar (logout)="onLogout()"></app-nav-bar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      padding: 24px;
      margin: 0 auto;
      max-width: 1536px;
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class MainLayoutComponent {
  constructor(private router: Router) {}

  onLogout() {
    // We'll move auth state management to a service later, 
    // but for now we follow the existing logic which was based in AppComponent.
    // However, since we are refactoring, we'll likely need an AuthService.
    this.router.navigate(['/login']);
  }
}
