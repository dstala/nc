import NcListResponse from '../../types/common/NcListResponse';
import NcPageParams from '../../types/common/NcPageParams';

export default class Apps {
  public static list(ageParams: NcPageParams): Promise<NcListResponse<any>> {
    return Promise.resolve(null);
  }
  public static create(data: any) {}
  public static update(id: string, data: any) {}
  public static delete(id: string) {}
  public static rename(id: string, name: string) {}
}
