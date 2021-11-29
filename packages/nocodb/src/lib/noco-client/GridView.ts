import Filter from './Filter';
import Sort from './Sort';
import Share from './Share';
import NcPageInfo from '../../types/common/NcPageInfo';
import NcListResponse from '../../types/common/NcListResponse';
import NcGridView from '../../types/NcGridView';

export default class GridView {
  public static list(
    pageInfo: NcPageInfo
  ): Promise<NcListResponse<NcGridView>> {
    return Promise.resolve(null);
  }
  public static create(data: NcGridView): Promise<NcGridView> {}
  public static update(id: string, filter: NcGridView): Promise<NcGridView> {}
  public static delete(id: string): Promise<void> {}
  public static rename(id: string, name: string): Promise<void> {}
  public static filter = Filter;
  public static sort = Sort;
  public static share = Share;
}
