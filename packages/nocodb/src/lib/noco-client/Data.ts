import Bulk from './Bulk';
import NcPageParams from '../../types/common/NcPageParams';
import NcListResponse from '../../types/common/NcListResponse';

export default class Data {
  public static list(pageParams: NcPageParams): Promise<NcListResponse<any>> {
    return Promise.resolve(null);
  }
  public static create(data: any): Promise<NcListResponse<any>> {
    return Promise.resolve(null);
  }
  public static update(id: string, data: any): Promise<any> {
    return Promise.resolve(null);
  }
  public static read(id: string): Promise<any> {
    return Promise.resolve(null);
  }
  public static exists(id: string): Promise<any> {
    return Promise.resolve(null);
  }
  public static delete(id: string): Promise<any> {
    return Promise.resolve(null);
  }
  public static count(params: any): Promise<any> {
    return Promise.resolve(null);
  }
  public static distinct(params: any): Promise<any> {
    return Promise.resolve(null);
  }
  public static aggregate(params: any): Promise<any> {
    return Promise.resolve(null);
  }
  public static distribution(params: any): Promise<any> {
    return Promise.resolve(null);
  }
  public static bulk = Bulk;
}
