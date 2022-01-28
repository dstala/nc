import NcPageInfo from '../../types/common/NcPageInfo';
import NcListResponse from '../../types/common/NcListResponse';
import NcSort from '../../types/NcSort';

export default class Sort {
  public static list(
    pageInfo: NcPageInfo
  ): Promise<NcListResponse<NcSort>> {
    return Promise.resolve(null);
  }
  public static create(data: NcSort): Promise<NcSort> {}
  public static update(id: string, filter: NcSort): Promise<NcSort> {}
  public static delete(id: string): Promise<void> {}
  public static rename(id: string, name: string): Promise<void> {}
}
