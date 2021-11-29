import NcListResponse from '../../types/common/NcListResponse';
import NcBase from '../../types/NcBase';
import NcPageInfo from '../../types/common/NcPageInfo';

export default class Audit {
  public static list(
    pageInfo: NcPageInfo
  ): Promise<NcListResponse<NcBase>> {}
}
