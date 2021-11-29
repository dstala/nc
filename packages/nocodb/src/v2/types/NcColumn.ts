import UITypes from '../../lib/sqlUi/UITypes';
import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

interface NcColumn extends NcTimestamps, NcOrder, NcSoftDelete {
  project_id: string;
  model_id: string;
  db_alias: 'db' | string;
  cn: string;
  _cn: string;
  uidt: UITypes;
  dt?: string;
  np?: number | string;
  ns?: number | string;
  clen?: number | string;
  cop?: number | string;
  pk?: boolean;
  rqd?: boolean;
  un?: boolean;
  ct?: string;
  ai?: boolean;
  unique?: boolean;
  ctf?: any;
  cc?: string;
  csn?: string;
  dtx?: string;
  dtxp?: string | number;
  dtxs?: string | number;
  au?: boolean;
}

export default NcColumn;
