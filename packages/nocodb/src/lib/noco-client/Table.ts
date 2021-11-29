import Relation from './Relation';
import Sort from './Sort';
import Filter from './Filter';
import GridView from './GridView';
import Webhook from './Webhook';
import NcPageParams from '../../types/common/NcPageParams';
import NcModel from '../../types/NcModel';
import NcListResponse from '../../types/common/NcListResponse';

export default class Table {
  public static list(
    pageParams: NcPageParams
  ): Promise<NcListResponse<NcModel>> {
    return Promise.resolve(null);
  }

  public static create(model: NcModel): Promise<NcModel> {
    return Promise.resolve(null);
  }
  public static update(id: string, model: NcModel): Promise<NcModel> {
    return Promise.resolve(null);
  }
  public static delete(id: string): Promise<void> {
    return Promise.resolve(null);
  }
  public static rename(id: string, name: string): Promise<void> {
    return Promise.resolve(null);
  }
  public static import() {}
  public static export() {}
  public static relation = Relation;
  public static filter = Filter;
  public static sort = Sort;
  public static gridView = GridView;
  public static webhook = Webhook;
}
