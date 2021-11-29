import NcTimestamps from './common/NcTimestamps';
import NcOrder from './common/NcOrder';
import NcSoftDelete from './common/NcSoftDelete';

export default interface NcKanbanView
  extends NcTimestamps,
    NcOrder,
    NcSoftDelete {
  id: string;
  project_id: string;
  db_alias: string;
  uuid: string;
  public: string;
  password: string;
  show_all_fields: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
}
