export interface IPage<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
  totalPages: number;
  numberOfElements: number;
}
