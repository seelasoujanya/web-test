import { Workflow } from './workflow.model';

export interface WorkflowInstance {
  id: number;
  workflowId: number;
  status: WorkflowInstanceStatus;
  completed: Date | null;
  duration: number | null;
  reason: string | null;
  triggerData: Record<string, unknown>;
  log: string | null;
  identifier: string;
  errorMessage: string | null;
  priority: Priority;
  created: Date;
  modified: Date;
  workflow?: Workflow;
}

export enum WorkflowInstanceStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  TERMINATED = 'TERMINATED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface WorkflowInstanceResponse {
  content: WorkflowInstance[];
  pageable: unknown;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: unknown;
  numberOfElements: number;
  empty: boolean;
}
