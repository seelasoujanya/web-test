import { IWorkflowConfigurationSection } from './config-section.model';
import { appleMusicSections } from './workflow-step-sections/apple-music';
import { ddexSections } from './workflow-step-sections/ddex';
import { excelGeneration } from './workflow-step-sections/excel-generation';
import { ftpStepSections } from './workflow-step-sections/ftp';
import { gcsStepSections } from './workflow-step-sections/gcs-bucket';
import { s3Uploader } from './workflow-step-sections/s3Uploader';
import { ugcErnDdex } from './workflow-step-sections/ugc-ern-ddex';

export interface StepConfigurationSection {
  stepType: string;
  sections: IWorkflowConfigurationSection[];
  title: string;
  requireTemplate: boolean;
  requireXsdValidation?: boolean;
}

export const stepConfigurationSections: StepConfigurationSection[] = [
  {
    stepType: 'DDEX',
    sections: ddexSections,
    title: 'DDEX Settings',
    requireTemplate: true,
    requireXsdValidation: true,
  },
  {
    stepType: 'GCS_UPLOADER',
    sections: gcsStepSections,
    title: 'GCS Bucket Settings',
    requireTemplate: false,
    requireXsdValidation: false,
  },
  {
    stepType: 'SFTP',
    sections: ftpStepSections,
    title: 'SFTP Settings',
    requireTemplate: false,
    requireXsdValidation: false,
  },
  {
    stepType: 'APPLE_MUSIC',
    sections: appleMusicSections,
    title: 'Apple Music Settings',
    requireTemplate: true,
    requireXsdValidation: false,
  },
  {
    stepType: 'UGC_ERN_DDEX',
    sections: ugcErnDdex,
    title: 'UGC-ERN-DDEX Settings',
    requireTemplate: true,
    requireXsdValidation: true,
  },
  {
    stepType: 'S3_UPLOADER',
    sections: s3Uploader,
    title: 'S3 Bucket Settings',
    requireTemplate: false,
    requireXsdValidation: false,
  },
  {
    stepType: 'EXCEL_GENERATION',
    sections: excelGeneration,
    title: 'Excel Generator',
    requireTemplate: false,
    requireXsdValidation: false,
  },
];
