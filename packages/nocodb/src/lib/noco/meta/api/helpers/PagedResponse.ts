import { Paginated } from 'nc-common';

export class PagedResponseImpl<T> {
  constructor(list: T[], pageInfo?: Paginated) {
    this.list = list;
    this.pageInfo = pageInfo;
    if (pageInfo) {
      pageInfo.isFirstPage = pageInfo.isFirstPage ?? pageInfo.page === 1;
      pageInfo.isLastPage =
        pageInfo.isLastPage ??
        pageInfo.page === Math.ceil(pageInfo.totalRows / pageInfo.pageSize);
    }
  }

  list: Array<T>;
  pageInfo: Paginated;
}