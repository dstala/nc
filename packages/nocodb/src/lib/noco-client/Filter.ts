import NcListResponse from '../../types/common/NcListResponse';
import NcPageInfo from '../../types/common/NcPageInfo';
import NcFilterExp from '../../types/NcFilterExp';

export default class Filter {
  public static list(
    pageInfo: NcPageInfo
  ): Promise<NcListResponse<NcFilterExp>> {
    return Promise.resolve(null);
  }
  public static create(filter: NcFilterExp): Promise<NcFilterExp> {}
  public static update(id: string, filter: NcFilterExp): Promise<NcFilterExp> {}
  public static delete(id: string): Promise<void> {}
}
