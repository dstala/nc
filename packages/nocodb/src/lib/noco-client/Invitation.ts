import NcPageInfo from '../../types/common/NcPageInfo';
import NcListResponse from '../../types/common/NcListResponse';
export default class Invitation {
  public static list(pageInfo: NcPageInfo): Promise<NcListResponse<any>> {
    return Promise.resolve(null);
  }
  public static accept() {}
  public static reject() {}
}
