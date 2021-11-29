import Table from './Table';
import ApiToken from './Apps';
import Audit from './Audit';
import Data from './Data';
import Apps from './ApiToken';
import Meta from './Meta';
import NcBase from '../../types/NcBase';
import NcPageInfo from '../../types/common/NcPageInfo';
import NcListResponse from '../../types/common/NcListResponse';

export default class Base {

  public static create(base: NcBase): Promise<NcBase> {
    return Promise.resolve(null);
  }

  public static list(pageInfo: NcPageInfo): Promise<NcListResponse<NcBase>> {
    return Promise.resolve(null);
  }

  public static update(id: string, base: NcBase): Promise<NcBase> {
    return Promise.resolve(null);
  }

  public static restart(id: string): Promise<void> {
    return Promise.resolve();
  }

  public static start(id: string): Promise<void> {
    return Promise.resolve();
  }

  public static stop(id: string): Promise<void> {
    return Promise.resolve();
  }

  public static delete(baseId: string): Promise<void> {
    return Promise.resolve();
  }

  public static log(): Promise<any> {
    return Promise.resolve();
  }

  public static table = Table;
  public static apiToken = ApiToken;
  public static audit = Audit;
  public static data = Data;
  public static apps = Apps;
  public static meta = Meta;

}
