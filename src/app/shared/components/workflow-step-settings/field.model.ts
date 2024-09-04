export interface IWorkflowStepField {
  key: string;
  label: string;
  type: 'textarea' | 'select' | 'input' | 'checkbox';
  placeholder?: string;
  values: string[];
  defaultValue?: string;
  description: string;
}
