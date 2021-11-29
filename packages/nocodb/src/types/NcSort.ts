import NcTimestamps from './common/NcTimestamps';

export default interface NcSort extends NcTimestamps {
  id: string;
  project_id: string;
  db_alias: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
  sort_order: number;
}
