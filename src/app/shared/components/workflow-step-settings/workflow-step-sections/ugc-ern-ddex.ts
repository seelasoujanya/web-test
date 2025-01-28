import { IWorkflowConfigurationSection } from '../config-section.model';
import { IWorkflowStepField } from '../field.model';

export const ugcErnDdex: IWorkflowConfigurationSection[] = [
  {
    title: 'Properties',
    fields: [
      {
        key: 'SUPPORT_ROUTE_TO_REVIEW',
        label: 'Include Support Route to Review',
        type: 'checkbox',
        placeholder: '',
        values: [],
        description: 'Include Support Route to Review',
        defaultValue: 'false',
        required: false,
      },
      {
        key: 'YOUTUBE_SHORTS',
        label: 'Include Youtube Shorts',
        type: 'checkbox',
        placeholder: '',
        values: [],
        description: 'Include Youtube Shorts',
        defaultValue: 'false',
        required: false,
      },
      {
        key: 'USE_DATE_TIME',
        label: 'Use Date Time',
        type: 'checkbox',
        placeholder: '',
        values: [],
        description: 'Use Date Time',
        section: 'properties',
        defaultValue: 'false',
        required: false,
      },
      {
        key: 'GLOBAL_DATE_TIME',
        label: 'Global Date Time',
        type: 'checkbox',
        placeholder: '',
        values: [],
        defaultValue: 'false',
        description: 'Global Date Time',
        required: false,
      },
      {
        key: 'SIMPLE_ASSET_NAMING',
        label: 'Simple Asset Naming',
        type: 'checkbox',
        placeholder: '',
        values: [],
        description: 'Simple Asset Naming',
        defaultValue: 'false',
        required: false,
      },
    ],
  },
  {
    title: 'Transcodes & Download Links',
    fields: [
      {
        key: 'AUDIO_TRANSCODE',
        label: 'Audio Transcode Type',
        type: 'select',
        placeholder: 'Transcode Type to be used for Audio',
        values: ['NONE', 'MP3', 'FLAC', 'STANDARD_DEFINITION'],
        defaultValue: 'NONE',
        description: 'Transcode Type to be used for Audio',
        section: 'Transcodes',
        required: false,
      },
    ],
  },
  {
    title: 'Asset Naming & Folder Structure',
    fields: [
      {
        key: 'RELEASE_TYPE',
        label: 'Release Type',
        type: 'select',
        placeholder: 'Folder structure will be created based on Release Type',
        values: ['STANDARD', 'BATCHED', 'RELEASE_BY_RELEASE'],
        defaultValue: 'STANDARD',
        description: 'Folder structure will be created based on Release Type',
        required: false,
      },
    ],
  },
];
