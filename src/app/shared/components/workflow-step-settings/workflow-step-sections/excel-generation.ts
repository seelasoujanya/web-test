import { IWorkflowConfigurationSection } from '../config-section.model';

export const excelGeneration: IWorkflowConfigurationSection[] = [
  {
    fields: [
      {
        key: 'SOCIETY',
        label: 'Template',
        type: 'select',
        placeholder: 'Select a Template',
        values: [
          'IHEART_BROKEN_BOW',
          'IPF_SLOVENIA',
          'ZPAV_POLAND',
          'IFPI_SWEDEN',
          'ABRAMUS_BRAZIL',
          'RUSSIA_PPI_REGISTRATION',
          'MAHASZ_HUNGARY',
        ],
        description: 'Select a Template',
        required: false,
      },
      {
        key: 'FILENAME',
        label: 'Filename',
        type: 'input',
        placeholder: 'Filename to be added as suffix',
        values: [],
        description: '',
        required: false,
      },
    ],
  },
];
