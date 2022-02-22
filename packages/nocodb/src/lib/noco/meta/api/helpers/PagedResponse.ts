import { PaginatedType } from 'nc-common';

export class PagedResponseImpl<T> {
  constructor(list: T[], pageInfo?: PaginatedType) {
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
  pageInfo: PaginatedType;
}
