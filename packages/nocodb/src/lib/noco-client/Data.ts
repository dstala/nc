import Bulk from './Bulk';
import NcPageParams from '../../types/common/NcPageParams';

export default class Data {
  public static list(pageParams: NcPageParams): Promise<any> {
    return Promise.resolve(null);
  }
  public static create() {}
  public static update() {}
  public static read() {}
  public static exists() {}
  public static delete() {}
  public static count() {}
  public static distinct() {}
  public static aggregate() {}
  public static distribution() {}
  public static bulk = Bulk;
}
