import { IWorkflowStepField } from '../field.model';

export const ftpFields: IWorkflowStepField[] = [
  {
    key: 'SFTP_HOST',
    label: 'Host',
    type: 'input',
    placeholder: 'Host',
    values: [],
    description: 'Add Host to Connect To Sftp',
  },
  {
    key: 'SFTP_USERNAME',
    label: 'Username',
    type: 'input',
    placeholder: 'Username',
    values: [],
    description: 'Add Username to Connect To Sftp',
  },
  {
    key: 'SFTP_PASSWORD',
    label: 'Password',
    type: 'input',
    placeholder: 'Password',
    values: [],
    description: 'Password to Connect To Sftp',
  },
  {
    key: 'SFTP_PORT',
    label: 'Port',
    type: 'input',
    placeholder: 'Port',
    values: [],
    description: 'Add Port On Which Sftp Is Running',
  },
  {
    key: 'SFTP_REMOTE_PATH',
    label: 'Remote Path',
    type: 'input',
    placeholder: 'Remote Path',
    values: [],
    description: 'Add Remote Path To Which We Need To Copy Files/Folders',
  },
];
