export const WORKFLOW_STATUS = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export const EMAIL_STATUS = [
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Failure', value: 'FAILURE' },
  { label: 'Both', value: 'BOTH' },
];

export const PRIORITY = [
  { label: 'High', value: 'HIGH' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
];
export const FOLDER_STRUCTURE = [
  { label: 'ReleaseByRelease', value: 'Release By Release' },
  { label: 'Batched', value: 'Batched' },
];

export const WORKFLOW_INSTANCE_STATUS = [
  { label: 'Created', value: 'CREATED' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Queued', value: 'QUEUED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Terminated', value: 'TERMINATED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paused', value: 'PAUSED' },
];

export const DELIVERY_TYPE = [
  { label: 'Data Only', value: 'DATA_ONLY' },
  { label: 'Packshot', value: 'PACKSHOT' },
  { label: 'Full Delivery', value: 'FULL_DELIVERY' },
  { label: 'Screengrab', value: 'SCREENGRAB' },
  { label: 'Cover Art', value: 'COVER_ART' },
  { label: 'Insert', value: 'INSERT' },
  { label: 'Take Down', value: 'TAKE_DOWN' },
  { label: 'None', value: 'NONE' },
];

export const DDEX = 'DDEX';
export const SLEEPING = 'SLEEPING';
export const SFTP = 'SFTP';
export const GCS_UPLOADER = 'GCS_UPLOADER';
export const XML_RUNNER = 'XML_RUNNER';

export const DATA_ONLY = 'DATA_ONLY';
export const PACKSHOT = 'PACKSHOT';
export const FULL_DELIVERY = 'FULL_DELIVERY';
export const SCREENGRAB = 'SCREENGRAB';
export const COVER_ART = 'COVER_ART';
export const INSERT = 'INSERT';
export const NONE = 'NONE';
export const TAKE_DOWN = 'TAKE_DOWN';
