export default interface NcListResponse<T> {
  list: T[];
  count: number;
  page: number;
  info: any;
}
