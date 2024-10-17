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
  { label: 'CREATED', value: 'CREATED' },
  { label: 'RUNNING', value: 'RUNNING' },
  { label: 'QUEUED', value: 'QUEUED' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'FAILED', value: 'FAILED' },
  { label: 'TERMINATED', value: 'TERMINATED' },
  { label: 'PENDING', value: 'PENDING' },
  { label: 'PAUSED', value: 'PAUSED' },
];

export const DELIVERY_TYPE = [
  { label: 'DATA_ONLY', value: 'DATA_ONLY' },
  { label: 'PACKSHOT', value: 'PACKSHOT' },
  { label: 'FULL_DELIVERY', value: 'FULL_DELIVERY' },
  { label: 'SCREENGRAB', value: 'SCREENGRAB' },
  { label: 'COVER_ART', value: 'COVER_ART' },
  { label: 'INSERT', value: 'INSERT' },
  { label: 'TAKE_DOWN', value: 'TAKE_DOWN' },
  { label: 'NONE', value: 'NONE' },
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
