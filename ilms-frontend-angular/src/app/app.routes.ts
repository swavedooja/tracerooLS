import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { 
        path: '', 
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) 
      },
      { 
        path: 'materials', 
        loadChildren: () => import('./features/materials/materials.routes').then(m => m.MATERIAL_ROUTES) 
      },
      { 
        path: 'locations', 
        loadChildren: () => import('./features/locations/locations.routes').then(m => m.LOCATION_ROUTES) 
      },
      { 
        path: 'label-management', 
        loadChildren: () => import('./features/label-management/label-management.routes').then(m => m.LABEL_MANAGEMENT_ROUTES) 
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
