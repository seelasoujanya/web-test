import { IWorkflowStepField } from '../field.model';

export const ftpFields: IWorkflowStepField[] = [
  {
    key: 'sftp_host',
    label: 'Host',
    type: 'input',
    placeholder: 'Host',
    values: [],
    description: 'Add Host to Connect To Sftp',
  },
  {
    key: 'sftp_username',
    label: 'Username',
    type: 'input',
    placeholder: 'Username',
    values: [],
    description: 'Add Username to Connect To Sftp',
  },
  {
    key: 'sftp_password',
    label: 'text',
    type: 'input',
    placeholder: 'Password',
    values: [],
    description: 'Password to Connect To Sftp',
  },
  {
    key: 'sftp_port',
    label: 'Port',
    type: 'input',
    placeholder: 'Port',
    values: [],
    description: 'Add Port On Which Sftp Is Running',
  },
  {
    key: 'sftp_remote_path',
    label: 'Remote Path',
    type: 'input',
    placeholder: 'Remote Path',
    values: [],
    description: 'Add Remote Path To Which We Need To Copy Files/Folders',
  },
];
