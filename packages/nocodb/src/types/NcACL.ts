export default interface NcACL {
  id: string;
  project_id: string;
  db_alias: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
  role: string;
  permission: string;
  enabled: boolean;
}
