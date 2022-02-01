export class PagedResponseImpl<T> implements PagedResponse<T> {
  constructor({
    content = [],
    page = 1,
    count,
    size = count
  }: {
    content: T[];
    size?: number;
    page?: number;
    count: number;
  }) {
    this.page = page;
    this.list = content;
    this.size = size;
    this.count = count;
    this.firstPage = page === 1;
    this.lastPage = page === Math.ceil(count / size);
  }

  count: number;
  page: number;
  size: number;
  list: Array<T>;
  firstPage: boolean;
  lastPage: boolean;
}

export default interface PagedResponse<T> {
  page: number;
  size: number;
  count: number;
  firstPage: boolean;
  lastPage: boolean;
  list: Array<T>;
}
