import NcListResponse from '../../types/common/NcListResponse';
import NcPageInfo from '../../types/common/NcPageInfo';

export default class Apps {
  // @ts-ignore
  public static list(ageParams: NcPageInfo): Promise<NcListResponse<any>> {
    return Promise.resolve(null);
  }
  // @ts-ignore
  public static create(data: any) {}
  // @ts-ignore
  public static update(id: string, data: any) {}
  // @ts-ignore
  public static delete(id: string) {}
  // @ts-ignore
  public static rename(id: string, name: string) {}
}
