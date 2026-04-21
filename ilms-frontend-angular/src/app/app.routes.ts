import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardMetricsComponent } from './components/dashboard-metrics/dashboard-metrics.component';
import { MaterialListComponent } from './components/material-list/material-list.component';
import { MaterialCreateComponent } from './components/material-create/material-create.component';
import { LocationListComponent } from './components/location-list/location-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardMetricsComponent },
  { path: 'materials', component: MaterialListComponent },
  { path: 'materials/new', component: MaterialCreateComponent },
  { path: 'materials/:code', component: MaterialCreateComponent },
  { path: 'locations', component: LocationListComponent },
  { path: 'label-management/material-inventory', component: MaterialInventoryComponent },
  { path: 'label-management/trade-item', component: TradeItemLabelManagementComponent },
  { path: 'label-management/shipping-item', component: ShippingLabelManagementComponent },
  { path: '**', redirectTo: '' }
];
