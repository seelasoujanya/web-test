import { IStepConfiguration } from './step-configuration.model';
import {
  DDEX,
  SLEEPING,
  SFTP,
  GCS_UPLOADER,
  XML_RUNNER,
} from '../utils/constants';

export interface IWorkflowStep {
  id: number;
  workflowId: number;
  executionOrder: number;
  name: string;
  type:
    | typeof DDEX
    | typeof SLEEPING
    | typeof SFTP
    | typeof GCS_UPLOADER
    | typeof XML_RUNNER;
  created: string;
  modified: string;
  workflowStepConfigurations: IStepConfiguration[];
}
