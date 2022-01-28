import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcFormViewColumn
  extends NcTimestamps,
    NcOrder,
    NcSoftDelete {
  id: string;
  project_id: string;
  db_alias: string;
  uuid: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
  label: string;
  help?: string;
  required: string;
  condition?: any;
}
