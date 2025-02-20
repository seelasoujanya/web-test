export interface IWorkflowStepField {
  key: string;
  label: string;
  type: 'textarea' | 'select' | 'input' | 'checkbox' | 'password';
  placeholder?: string;
  values: string[];
  defaultValue?: string;
  description: string;
  section?: string;
  required: boolean;
}
