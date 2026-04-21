import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent, LoginComponent, CommonModule],
  template: `
    <div class="app-container" *ngIf="isAuthenticated; else loginScreen">
      <app-nav-bar (logout)="onLogout()"></app-nav-bar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
    
    <ng-template #loginScreen>
      <app-login (loginSuccess)="onLogin()"></app-login>
    </ng-template>
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
      max-width: 1536px; /* Matches xl maxWidth from MUI Container */
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;

  constructor(private router: Router) {}

  onLogin() {
    this.isAuthenticated = true;
    this.router.navigate(['/']);
  }

  onLogout() {
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
