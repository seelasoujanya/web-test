import { IWorkflowStepField } from '../field.model';

export const gcsBucketFields: IWorkflowStepField[] = [
  {
    key: 'gcs_bucket_name',
    label: 'Bucket Name',
    type: 'input',
    placeholder: 'Enter GCS bucket name',
    values: [],
    description: 'Enter GCS bucket name',
  },
  {
    key: 'gcs_service_account',
    label: 'Service Account',
    type: 'textarea',
    placeholder: 'Add JSON service account',
    values: [],
    description: 'Add JSON service account',
  },
];
