import { ddexFields } from './step-fields/ddex';
import { ftpFields } from './step-fields/ftp';
import { gcsBucketFields } from './step-fields/gcs-bucket';

export const stepFields = [
  { stepType: 'DDEX', fields: ddexFields, title: 'DDEX Settings' },
  { stepType: 'SFTP', fields: ftpFields, title: 'FTP Settings' },
  {
    stepType: 'GCS_UPLOADER',
    fields: gcsBucketFields,
    title: 'GCS Bucket Settings',
  },
];
