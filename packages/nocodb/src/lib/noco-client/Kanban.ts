import Filter from './Filter';
import Sort from './Sort';
import Share from './Share';
import NcPageParams from '../../types/common/NcPageParams';
import NcListResponse from '../../types/common/NcListResponse';
import NcKanbanView from '../../types/NcKanbanView';
export default class KanbanView {
  public static list(
    pageParams: NcPageParams
  ): Promise<NcListResponse<NcKanbanView>> {
    return Promise.resolve(null);
  }
  public static create(data: NcKanbanView): Promise<NcKanbanView> {}
  public static update(
    id: string,
    filter: NcKanbanView
  ): Promise<NcKanbanView> {}
  public static delete(id: string): Promise<void> {}
  public static rename(id: string, name: string): Promise<void> {}
  public static filter = Filter;
  public static sort = Sort;
  public static share = Share;
}
