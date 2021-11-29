import Table from './Table';
import ApiToken from './Apps';
import Audit from './Audit';
import Data from './Data';
import Apps from './ApiToken';
import Meta from './Meta';
import NcBase from '../../types/NcBase';
import NcPageParams from '../../types/common/NcPageParams';

export default class Base {
  public static create(base: NcBase): Promise<NcBase> {
    return Promise.resolve(null);
  }
  public static list(pageParams: NcPageParams): Promise<NcBase[]> {
    return Promise.resolve(null);
  }
  public static update(id: string, base: NcBase): Promise<NcBase[]> {
    return Promise.resolve(null);
  }
  public static restart(): Promise<void> {
    return Promise.resolve();
  }
  public static start(): Promise<void> {
    return Promise.resolve();
  }
  public static stop(): Promise<void> {
    return Promise.resolve();
  }
  public static delete(basId: string): Promise<void> {
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
