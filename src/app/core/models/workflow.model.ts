export interface Workflow {
  description: any;
  throttleLimit: any;
  isTaskChainIsValid: any;
  id: number;
  name: string;
  enabled: boolean;
  paused: boolean;
  created: string;
  modified: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISABLED';
  alias: string;
}

export interface WorkflowResponse {
  content: Workflow[];
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

export interface SystemProperty {
  id: number;
  key: string;
  value: string;
  description: string | null;
  created: string;
  modified: string;
}

export interface SystemPropertiesDTO {
  key: string | undefined;
  value: string;
  description: string | undefined | null;
}

export interface WorkflowConfiguration {
  key: string;
  value: any;
}
