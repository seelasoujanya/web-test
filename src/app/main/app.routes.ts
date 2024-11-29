import { Routes } from '@angular/router';
import { WorkflowsComponent } from '../features/workflows/workflows.component';
import { LoginComponent } from '../shared/components/login/login.component';
import { XmlTemplatesComponent } from '../features/xml-templates/xml-templates.component';
import { MonitorComponent } from '../features/monitor/monitor.component';
import { WorkflowDetailsComponent } from '../features/workflow-details/workflow-details.component';
import { WorkflowDetailViewComponent } from '../features/workflow-details/workflow-instance-detail-view/workflow-instance-detail-view.component';
import { TemplateVersionDetailsComponent } from '../features/xml-templates/template-version-details/template-version-details.component';
import { WorkflowGeneralComponent } from '../features/workflow-details/workflow-general/workflow-general.component';
import { WorkflowHistoryComponent } from '../features/workflow-details/workflow-history/workflow-history.component';
import { WorkflowSettingsComponent } from '../features/workflow-details/workflow-settings/workflow-settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'monitor', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'workflows', component: WorkflowsComponent },
  { path: 'templates', component: XmlTemplatesComponent },
  { path: 'errors', component: MonitorComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'partners', component: MonitorComponent },
  {
    path: 'workflows/:id',
    component: WorkflowDetailsComponent,
    children: [
      { path: 'general', component: WorkflowGeneralComponent },
      { path: 'settings', component: WorkflowSettingsComponent },
      { path: 'history', component: WorkflowHistoryComponent },
    ],
  },
  {
    path: 'workflows/:workflowId/workflowinstance/:id',
    component: WorkflowDetailViewComponent,
  },
  { path: 'templates/:id', component: TemplateVersionDetailsComponent },
];
