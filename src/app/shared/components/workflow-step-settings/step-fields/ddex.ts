import { IWorkflowStepField } from '../field.model';

export const ddexFields: IWorkflowStepField[] = [
  {
    key: 'RELEASE_TYPE',
    label: 'Release Type',
    type: 'select',
    placeholder: 'Folder structure will be created based on Release Type',
    values: ['STANDARD', 'BATCHED', 'RELEASE_BY_RELEASE'],
    defaultValue: 'STANDARD',
    description: 'Folder structure will be created based on Release Type',
    section: 'Folder structure',
  },

  {
    key: 'all_date_deal',
    label: 'Include All Date Deals',
    type: 'checkbox',
    placeholder: 'Create All Date Deals',
    values: [],
    description: 'Include All Date Deals',
  },
  {
    key: 'PRODUCT_TRANSCODE',
    label: 'Product Asset Transcode Type',
    type: 'select',
    placeholder: 'Transcode Type to be used for Product Assets',
    values: ['NONE', 'JPG'],
    defaultValue: 'NONE',
    description: 'Transcode Type to be used for Product Assets',
    section: 'Transcodes',
  },
  {
    key: 'AUDIO_TRANSCODE',
    label: 'Audio Transcode Type',
    type: 'select',
    placeholder: 'Transcode Type to be used for Audio',
    values: ['NONE', 'MP3', 'FLAC', 'STANDARD_DEFINITION'],
    defaultValue: 'NONE',
    description: 'Transcode Type to be used for Audio',
    section: 'Transcodes',
  },

  {
    key: 'DOWNLOAD_LINK',
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
      'The Selected Type of Assets Will Be Replaced with Download Links, If Not Present The Download Links Are Generated',
    section: 'Download Links',
  },
  // {
  //   key: 'takeDownDeals',
  //   label: 'Take Down Deals',
  //   type: 'checkbox',
  //   defaultValue: 'false',
  //   placeholder: 'Create Take Down Deals',
  //   values: [],
  //   description: 'Include Take Down Deals',
  //   section: 'properties',
  // },
  // {
  //   key: 'additionalReleaseType',
  //   label: 'Additional Release Type',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Additional Release Type.',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'marketingComments',
  //   label: 'Marketing Comments',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Marketing Comments.',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'synopsis',
  //   label: 'Synopsis',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Synopsis',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'dealExclusivity',
  //   label: 'Deal Exclusivity',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Exclusive Deal',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'adaContributorRoles',
  //   label: 'ADA Contributor Roles',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include ADA Contributor Roles',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'spotifyReleaseType',
  //   label: 'Spotify Release Type',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Spotify Release Type',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'fileName',
  //   label: 'File Name',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include File Name',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'catalogueNumber',
  //   label: 'Catalogue Number',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Catalogue Number',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'versionTitleBracketing',
  //   label: 'Version Title Bracketing',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Version Title Bracketing',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  // {
  //   key: 'includeAtmosFiles',
  //   label: 'Include Atmos Files',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Atmos Files',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  {
    key: 'INCLUDE_KOSOVO',
    label: 'Include Kosovo in Definition of World',
    type: 'checkbox',
    placeholder: '',
    values: [],
    description: 'Include Kosovo in Territories',
    section: 'properties',
    defaultValue: 'false',
  },
  // {
  //   key: 'projectDetails',
  //   label: 'Include Project Details',
  //   type: 'checkbox',
  //   placeholder: '',
  //   values: [],
  //   description: 'Include Project Details',
  //   section: 'properties',
  //   defaultValue: 'false',
  // },
  {
    key: 'USE_DATE_TIME',
    label: 'Use Date Time',
    type: 'checkbox',
    placeholder: '',
    values: [],
    description: 'Use Date Time',
    section: 'properties',
    defaultValue: 'false',
  },
];
