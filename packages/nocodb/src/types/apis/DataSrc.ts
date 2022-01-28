import NcTimestamps from '../common/NcTimestamps';
import NcSoftDelete from '../common/NcSoftDelete';
import NcOrder from '../common/NcOrder';

export default interface NcDataSrc extends NcTimestamps, NcOrder, NcSoftDelete {
  id: string;
  alias: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  url?: string;
  ssl?: boolean | any;
  database?: string;
  params?: any;
  token?: string;
  type: any;
}
