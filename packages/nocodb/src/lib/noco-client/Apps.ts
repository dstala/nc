import NcListResponse from '../../types/common/NcListResponse';
import NcBase from '../../types/NcBase';
import NcPageInfo from '../../types/common/NcPageInfo';

export default class ApiToken {
  public static list(params: NcPageInfo): Promise<NcListResponse<NcBase>> {}
  public static create() {}
  public static update() {}
  public static delete() {}
}
