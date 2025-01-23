import { IWorkflowConfigurationSection } from '../config-section.model';

export const ftpStepSections: IWorkflowConfigurationSection[] = [
  {
    fields: [
      {
        key: 'SFTP_HOST',
        label: 'Host',
        type: 'input',
        placeholder: 'Host',
        values: [],
        description: 'Add Host to Connect To Sftp',
        required: true,
      },
      {
        key: 'SFTP_USERNAME',
        label: 'Username',
        type: 'input',
        placeholder: 'Username',
        values: [],
        description: 'Add Username to Connect To Sftp',
        required: true,
      },
      {
        key: 'SFTP_PASSWORD',
        label: 'Password',
        type: 'input',
        placeholder: 'Password',
        values: [],
        description: 'Password to Connect To Sftp',
        required: true,
      },
      {
        key: 'SFTP_PORT',
        label: 'Port',
        type: 'input',
        placeholder: 'Port',
        values: [],
        description: 'Add Port On Which Sftp Is Running',
        required: true,
      },
      {
        key: 'SFTP_REMOTE_PATH',
        label: 'Remote Path',
        type: 'input',
        placeholder: 'Remote Path',
        values: [],
        description: 'Add Remote Path To Which We Need To Copy Files/Folders',
        required: false,
      },
    ],
  },
];
