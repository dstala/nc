export default interface NcFilterExp {
  id: string;
  project_id: string;
  db_alias: string;
  tn: string;
  _tn: string;
  cn: string;
  _cn: string;
  comparison_op: string;
  value: string;
  start?: string;
  stop?: string;
  op: 'AND' | 'OR' | string;
  grp_idx?: number;
  grp_op: 'AND' | 'OR' | string;
}
