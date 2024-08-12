import { IWorkflowStepField } from '../field.model';

export const ftpFields: IWorkflowStepField[] = [
  {
    key: 'sftp_host',
    label: 'Host',
    type: 'input',
    placeholder: 'Host',
    values: [],
  },
  {
    key: 'sftp_username',
    label: 'Username',
    type: 'input',
    placeholder: 'Username',
    values: [],
  },
  {
    key: 'sftp_password',
    label: 'Password',
    type: 'input',
    placeholder: 'Password',
    values: [],
  },
  {
    key: 'sftp_port',
    label: 'Port',
    type: 'input',
    placeholder: 'Port',
    values: [],
  },
  {
    key: 'sftp_remote_path',
    label: 'Remote Path',
    type: 'input',
    placeholder: 'Remote Path',
    values: [],
  },
];
