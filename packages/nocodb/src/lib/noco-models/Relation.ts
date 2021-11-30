import Noco from '../../lib/noco/Noco';
import NcColumn from '../../types/NcColumn';
import NcRelation from '../../types/NcRelation';

export default class Relation implements NcRelation {
  constructor(data: NcColumn) {
    Object.assign(this, data);
  }

  public static async insert(relation: NcRelation) {
    await Noco.ncMeta.metaInsert2(
      relation.base_id,
      relation.db_alias,
      'nc_relations_2',
      relation
    );
  }
  public static async list({
    project_id,
    db_alias,
    condition
  }: {
    project_id: string;
    db_alias: string;
    condition: any;
  }): Promise<Relation[]> {
    return (
      await Noco.ncMeta.metaList2(project_id, db_alias, 'nc_relations_2', {
        condition
      })
    ).map(m => new Relation(m));
  }

  _cn: string;
  _rcn: string;
  _rtn: string;
  _tn: string;
  cn: string;
  created_at: Date | number | string;
  db_alias: 'db' | string;
  db_type: string;
  deleted: boolean;
  dr: string;
  fkn: string;
  id: string;
  order: number;
  base_id: string;
  rcn: string;
  ref_db_alias: string;
  rtn: string;
  tn: string;
  type: string;
  updated_at: Date | number | string;
  ur: string;
  column_id: string;
  ref_column_id: string;
}
