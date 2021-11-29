import NcPageParams from '../../types/common/NcPageParams';
import NcListResponse from '../../types/common/NcListResponse';
export default class Invitation {
  public static list(pageParams: NcPageParams): Promise<NcListResponse<any>> {
    return Promise.resolve(null);
  }
  public static accept() {}
  public static reject() {}
}
