import { Routes } from '@angular/router';
import { MaterialListComponent } from './components/material-list/material-list.component';
import { MaterialCreateComponent } from './components/material-create/material-create.component';
import { MaterialInventoryComponent } from './components/material-inventory/material-inventory.component';

export const MATERIAL_ROUTES: Routes = [
  { path: '', component: MaterialListComponent },
  { path: 'new', component: MaterialCreateComponent },
  { path: 'inventory', component: MaterialInventoryComponent },
  { path: ':code', component: MaterialCreateComponent }
];
