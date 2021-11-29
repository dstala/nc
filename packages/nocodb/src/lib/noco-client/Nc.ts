import Base from './Base';
import Auth from './Auth';
import Org from './Org';

export class Nc {
  public static config;

  public static init(config: any) {
    this.config = config;
  }

  public static base = Base;
  public static auth = Auth;
  public static org = Org;
}
