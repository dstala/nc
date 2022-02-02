import { Paginated } from '../../../noco-client/data-contracts';

export class PagedResponseImpl<T> {
  constructor(list: T[], pageInfo?: Paginated) {
    this.list = list;
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
