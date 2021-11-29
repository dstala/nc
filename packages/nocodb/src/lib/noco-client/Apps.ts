import NcListResponse from '../../types/common/NcListResponse';
import NcBase from '../../types/NcBase';
import NcPageParams from '../../types/common/NcPageParams';

export default class ApiToken {
  public static list(params: NcPageParams): Promise<NcListResponse<NcBase>> {}
  public static create() {}
  public static update() {}
  public static delete() {}
}
