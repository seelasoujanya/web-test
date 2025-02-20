import { IWorkflowConfigurationSection } from '../config-section.model';

export const s3Uploader: IWorkflowConfigurationSection[] = [
  {
    fields: [
      {
        key: 'SKIP_TASK',
        label: 'Skip Task',
        type: 'checkbox',
        placeholder: 'Skip Task',
        values: [],
        description: 'Skip Task',
        required: false,
      },
      {
        key: 'S3_BUCKET_NAME',
        label: 'Bucket Name',
        type: 'input',
        placeholder: 'Bucket name to upload the files to',
        values: [],
        description: 'Bucket name to upload the files to',
        required: true,
      },
      {
        key: 'S3_ACCESS_KEY_ID',
        label: 'Access Key Id',
        type: 'input',
        placeholder: 'S3 access key id',
        values: [],
        description: 's3 access key',
        required: true,
      },

      {
        key: 'S3_SECRET_ACCESS_KEY',
        label: 'Secret Access Key',
        type: 'input',
        placeholder: 'S3 secret access key id',
        values: [],
        description: 's3 secret access key',
        required: true,
      },
      {
        key: 'REGION',
        label: 'Region',
        type: 'input',
        placeholder: 'Region',
        values: [],
        description: 'Region for S3 access',
        required: true,
      },
      {
        key: 'DIRECTORY',
        label: 'Directory',
        type: 'input',
        placeholder: 'Directory',
        values: [],
        description: 'Directory for S3 uploader',
        required: false,
      },
    ],
  },
];
