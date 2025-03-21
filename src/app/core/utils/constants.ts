export const WORKFLOW_STATUS = [
  { label: 'YES', value: 'ACTIVE' },
  { label: 'NO', value: 'INACTIVE' },
];

export const EMAIL_STATUS = [
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Failure', value: 'FAILURE' },
  { label: 'Both', value: 'BOTH' },
];

export const PRIORITY = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];
export const FOLDER_STRUCTURE = [
  { label: 'ReleaseByRelease', value: 'Release By Release' },
  { label: 'Batched', value: 'Batched' },
];

export const WORKFLOW_INSTANCE_STATUS = [
  { label: 'Success', value: 'COMPLETED' },
  { label: 'Error', value: 'FAILED' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Queued', value: 'QUEUED' },
  { label: 'Running', value: 'RUNNING' },
  { label: 'Terminated', value: 'TERMINATED' },
];

export const DELIVERY_TYPE = [
  { label: 'Full Delivery', value: 'FULL_DELIVERY' },
  { label: 'Data Only', value: 'DATA_ONLY' },
  { label: 'Packshot', value: 'PACKSHOT' },
  { label: 'Screengrab', value: 'SCREENGRAB' },
  { label: 'Cover Art', value: 'COVER_ART' },
  { label: 'Insert', value: 'INSERT' },
  { label: 'Take Down', value: 'TAKE_DOWN' },
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
