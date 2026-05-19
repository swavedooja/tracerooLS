import { Routes } from '@angular/router';
import { TradeItemLabelManagementComponent } from './components/trade-item-label-management/trade-item-label-management.component';
import { ShippingLabelManagementComponent } from './components/shipping-label-management/shipping-label-management.component';
import { LabelDesignerComponent } from './components/label-designer/label-designer.component';
import { PrintStationComponent } from './components/print-station/print-station.component';

export const LABEL_MANAGEMENT_ROUTES: Routes = [
  { path: 'trade-item', component: TradeItemLabelManagementComponent },
  { path: 'shipping-item', component: ShippingLabelManagementComponent },
  { path: 'designer/:id', component: LabelDesignerComponent },
  { path: 'designer', component: LabelDesignerComponent },
  { path: 'print-station', component: PrintStationComponent }
];
