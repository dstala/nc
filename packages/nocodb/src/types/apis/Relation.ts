import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcRelation
  extends NcTimestamps,
    NcOrder,
    NcSoftDelete {
  id: string;
  project_id: string;
  db_alias: 'db' | string;
  tn: string;
  _tn: string;
  rtn: string;
  _rtn: string;
  cn: string;
  _cn: string;
  rcn: string;
  _rcn: string;
  ref_db_alias: string;
  type: string;
  db_type: string;
  ur: string;
  dr: string;
  fkn: string;
}
