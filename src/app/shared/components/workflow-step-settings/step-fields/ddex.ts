import { IWorkflowStepField } from '../field.model';

export const ddexFields: IWorkflowStepField[] = [
  {
    key: 'album_streaming_deals',
    label: 'Include Album Streaming Deals',
    type: 'checkbox',
    placeholder: 'Create Album Streaming Deals',
    values: [],
  },
  {
    key: 'take_down_deals',
    label: 'Include Take Down Deals',
    type: 'checkbox',
    placeholder: 'Create Take Down Deals',
    values: [],
  },
  {
    key: 'product_assets_transcode',
    label: 'Product Asset Transcode Type',
    type: 'select',
    placeholder: 'Transcode Type to be used for Product Assets',
    values: ['NONE', 'JPG', 'TIFF'],
    defaultValue: 'NONE',
  },
  {
    key: 'audio_transcode',
    label: 'Audio Transcode Type',
    type: 'select',
    placeholder: 'Transcode Type to be used for Audio',
    values: ['NONE', 'MP3', 'FLAC', 'STANDARD_DEFINITION'],
    defaultValue: 'NONE',
  },
  {
    key: 'releaseType',
    label: 'Release Type',
    type: 'select',
    placeholder: 'Folder structure will be created based on Release Type',
    values: ['STANDARD', 'BATCHED', 'RELEASE_BY_RELEASE'],
    defaultValue: 'STANDARD',
  },
  {
    key: 'attempts',
    label: 'Attempts',
    type: 'input',
    placeholder: 'Number of attempts to request Download Links',
    values: [],
  },
  {
    key: 'assets_to_replace',
    label: 'Assets to Replace with Download Links',
    type: 'select',
    placeholder: 'Assets to Replace with Download Links',
    values: [
      'NONE',
      'TRACK_ASSETS',
      'VIDEO_ASSETS',
      'AUDIO_ASSETS',
      'ALL_ASSETS',
    ],
    defaultValue: 'NONE',
  },
];
