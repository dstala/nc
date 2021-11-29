import NcListResponse from '../../types/common/NcListResponse';
import NcBase from '../../types/NcBase';
import NcPageParams from '../../types/common/NcPageParams';

export default class Audit {
  public static list(
    pageParams: NcPageParams
  ): Promise<NcListResponse<NcBase>> {}
}
