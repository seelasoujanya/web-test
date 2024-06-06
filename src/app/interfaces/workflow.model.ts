export interface Workflow {
  id: number;
  name: string;
  enabled: boolean;
  paused: boolean;
  created: any;
  modified: any;
}

export interface WorkflowResponse {
  content: Workflow[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  empty: boolean;
}
