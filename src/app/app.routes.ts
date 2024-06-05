import { Routes } from '@angular/router';
import { WorkflowsComponent } from './features/workflows/workflows.component';
import { XmlTemplatesComponent } from './features/xml-templates/xml-templates.component';
import { MonitorComponent } from './features/monitor/monitor.component';

export const routes: Routes = [
  { path: '', component: WorkflowsComponent },
  { path: 'workflows', component: WorkflowsComponent },
  { path: 'templates', component: XmlTemplatesComponent },
  { path: 'errors', component: MonitorComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'partners', component: MonitorComponent },
];
