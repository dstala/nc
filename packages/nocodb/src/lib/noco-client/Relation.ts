import NcPageInfo from '../../types/common/NcPageInfo';
import NcListResponse from '../../types/common/NcListResponse';
import NcRelation from '../../types/apis/Relation';

export default class Relation {
  public static list(
    pageInfo: NcPageInfo
  ): Promise<NcListResponse<NcRelation>> {
    return Promise.resolve(null);
  }
  public static create(data: NcRelation): Promise<NcRelation> {}
  public static update(id: string, filter: NcRelation): Promise<NcRelation> {}
  public static delete(id: string): Promise<void> {}
}
