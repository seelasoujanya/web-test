import { IWorkflowConfigurationSection } from '../config-section.model';

export const gcsStepSections: IWorkflowConfigurationSection[] = [
  {
    fields: [
      {
        key: 'GCS_BUCKET_NAME',
        label: 'Bucket Name',
        type: 'input',
        placeholder: 'Bucket name to upload the files to',
        values: [],
        description: 'Bucket name to upload the files to',
        required: true,
      },
      {
        key: 'GCS_REMOTE_DIRECTORY',
        label: 'Remote Directory',
        type: 'input',
        placeholder: 'Copies files to this directory',
        values: [],
        description: 'Copies files to this directory',
        required: false,
      },
      {
        key: 'GCS_SKIP_UPLOAD',
        label: 'Skip Upload',
        type: 'checkbox',
        placeholder: 'Skip Uploads',
        values: [],
        description: 'Skip Upload',
        required: false,
      },
      {
        key: 'GCS_SERVICE_ACCOUNT',
        label: 'Service Account',
        type: 'textarea',
        placeholder: 'JSON service account',
        values: [],
        description: 'JSON service account',
        required: true,
      },
    ],
  },
];
