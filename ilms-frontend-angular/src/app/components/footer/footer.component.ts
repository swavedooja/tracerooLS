import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer no-print">
      <div class="footer-content">
        <p>&copy; 2026 SLS Material Management ILMS. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--background-paper);
      padding: 24px;
      text-align: center;
      border-top: 1px solid #E0E0E0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-top: auto;
    }
    .footer-content {
      max-width: 1536px;
      margin: 0 auto;
    }
  `]
})
export class FooterComponent {}
