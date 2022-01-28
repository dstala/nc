import NcPageInfo from '../../types/common/NcPageInfo';
import NcListResponse from '../../types/common/NcListResponse';
import NcOrg from '../../types/NcOrg';

export default class Org {
  public static list(pageInfo: NcPageInfo): Promise<NcListResponse<NcOrg>> {
    return Promise.resolve(null);
  }
  public static create(data: NcOrg): Promise<NcOrg> {}
  public static update(id: string, filter: NcOrg): Promise<NcOrg> {}
  public static delete(id: string): Promise<void> {}
  public static rename(id: string, name: string): Promise<void> {}
}
