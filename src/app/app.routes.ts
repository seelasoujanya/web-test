import { Routes } from '@angular/router';
import { WorkflowsComponent } from './workflows/workflows.component';
import { XmlTemplatesComponent } from './features/xml-templates/xml-templates.component';
import { MonitorComponent } from './features/monitor/monitor.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  { path: '', component: WorkflowsComponent, canActivate: [authGuard] },
  {
    path: 'workflows',
    component: WorkflowsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'templates',
    component: XmlTemplatesComponent,
    canActivate: [authGuard],
  },
  { path: 'errors', component: MonitorComponent, canActivate: [authGuard] },
  { path: 'monitor', component: MonitorComponent, canActivate: [authGuard] },
  { path: 'partners', component: MonitorComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
];
