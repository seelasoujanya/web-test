import { IWorkflowConfigurationSection } from './config-section.model';
import { appleMusicSections } from './workflow-step-sections/apple-music';
import { ddexSections } from './workflow-step-sections/ddex';
import { ftpStepSections } from './workflow-step-sections/ftp';
import { gcsStepSections } from './workflow-step-sections/gcs-bucket';

export interface StepConfigurationSection {
  stepType: string;
  sections: IWorkflowConfigurationSection[];
  title: string;
  requireTemplate: boolean;
}

export const stepConfigurationSections: StepConfigurationSection[] = [
  {
    stepType: 'DDEX',
    sections: ddexSections,
    title: 'DDEX Settings',
    requireTemplate: true,
  },
  {
    stepType: 'GCS_UPLOADER',
    sections: gcsStepSections,
    title: 'GCS Bucket Settings',
    requireTemplate: false,
  },
  {
    stepType: 'SFTP',
    sections: ftpStepSections,
    title: 'SFTP Settings',
    requireTemplate: false,
  },
  {
    stepType: 'APPLE_MUSIC',
    sections: appleMusicSections,
    title: 'Apple Music Settings',
    requireTemplate: true,
  },
];
