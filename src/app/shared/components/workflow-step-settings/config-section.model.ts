import { IWorkflowStepField } from './field.model';

export interface IWorkflowConfigurationSection {
  title?: string;
  fields: IWorkflowStepField[];
}
