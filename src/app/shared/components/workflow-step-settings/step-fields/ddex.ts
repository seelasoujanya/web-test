import { IWorkflowStepField } from '../field.model';

export const ddexFields: IWorkflowStepField[] = [
  {
    key: 'album_streaming_deals',
    label: 'Include Album Streaming Deals',
    type: 'checkbox',
    placeholder: 'Create Album Streaming Deals',
    values: [],
    description: 'Include Album Streaming Deals',
  },
  {
    key: 'take_down_deals',
    label: 'Include Take Down Deals',
    type: 'checkbox',
    placeholder: 'Create Take Down Deals',
    values: [],
    description: 'Include Take Down Deals',
  },
  {
    key: 'productAssetOption',
    label: 'Product Asset Transcode Type',
    type: 'select',
    placeholder: 'Transcode Type to be used for Product Assets',
    values: ['NONE', 'JPG'],
    defaultValue: 'NONE',
    description: 'Transcode Type to be used for Product Assets',
  },
  {
    key: 'trackAssetOption',
    label: 'Audio Transcode Type',
    type: 'select',
    placeholder: 'Transcode Type to be used for Audio',
    values: ['NONE', 'MP3', 'FLAC', 'STANDARD_DEFINITION'],
    defaultValue: 'NONE',
    description: 'Transcode Type to be used for Audio',
  },
  {
    key: 'releaseType',
    label: 'Release Type',
    type: 'select',
    placeholder: 'Folder structure will be created based on Release Type',
    values: ['STANDARD', 'BATCHED', 'RELEASE_BY_RELEASE'],
    defaultValue: 'STANDARD',
    description: 'Folder structure will be created based on Release Type',
  },
  {
    key: 'attempts',
    label: 'Attempts',
    type: 'input',
    placeholder: 'Number of attempts to request Download Links',
    values: [],
    description: 'Number of attempts to request Download Links',
  },
  {
    key: 'replaceWithDownloadLinks',
    label: 'Assets to Replace with Download Links',
    type: 'select',
    placeholder: 'Assets to Replace with Download Links',
    values: [
      'NONE',
      'TRACK_ASSETS',
      'VIDEO_ASSETS',
      'AUDIO_ASSETS',
      'ALL_ASSETS',
      'PRODUCT_ASSETS',
    ],
    defaultValue: 'NONE',
    description:
      'The Selected Type of Asssets Will Be Replaced with Download Links,If Not Present The DownLoad Links Are Generated',
  },
];
