import { IWorkflowStepField } from '../field.model';

export const gcsBucketFields: IWorkflowStepField[] = [
  {
    key: 'GCS_BUCKET_NAME',
    label: 'Bucket Name',
    type: 'input',
    placeholder: 'Enter GCS bucket name',
    values: [],
    description: 'Enter GCS bucket name',
  },
  {
    key: 'GCS_SERVICE_ACCOUNT',
    label: 'Service Account',
    type: 'textarea',
    placeholder: 'Add JSON service account',
    values: [],
    description: 'Add JSON service account',
  },
];
