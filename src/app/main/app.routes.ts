import { Routes } from '@angular/router';
import { WorkflowsComponent } from '../features/workflows/workflows.component';
import { LoginComponent } from '../shared/components/login/login.component';
import { XmlTemplatesComponent } from '../features/xml-templates/xml-templates.component';
import { MonitorComponent } from '../features/monitor/monitor.component';
import { WorkflowDetailsComponent } from '../features/workflow-details/workflow-details.component';
import { WorkflowDetailViewComponent } from '../features/workflow-details/workflow-detail-view/workflow-detail-view.component';
import { TemplateVersionDetailsComponent } from '../features/xml-templates/template-version-details/template-version-details.component';

export const routes: Routes = [
  { path: '', component: WorkflowsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'workflows', component: WorkflowsComponent },
  { path: 'templates', component: XmlTemplatesComponent },
  { path: 'errors', component: MonitorComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'partners', component: MonitorComponent },
  { path: 'workflows/:id', component: WorkflowDetailsComponent },
  { path: 'workflowinstance/:id', component: WorkflowDetailViewComponent },
  { path: 'template/:id', component: TemplateVersionDetailsComponent },
];
