import {
  AuditOperationTypes,
  AuditType,
  CommentListParamsType
} from 'nc-common';
import { MetaTable } from '../utils/globals';
import Noco from '../noco/Noco';

export default class Audit implements AuditType {
  id?: string;
  user?: string;
  ip?: string;
  base_id?: string;
  project_id?: string;
  fk_model_id?: string;
  row_id?: string;
  op_type?: string;
  op_sub_type?: string;
  status?: string;
  description?: string;
  details?: string;

  constructor(audit: Partial<Audit>) {
    Object.assign(this, audit);
  }

  public static async get(auditId: string) {
    const audit = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.AUDIT,
      auditId
    );
    return audit && new Audit(audit);
  }

  public static async insert(audit: Partial<Audit>) {
    const { id } = await Noco.ncMeta.metaInsert2(null, null, MetaTable.AUDIT, {
      user: audit.user,
      ip: audit.ip,
      base_id: audit.base_id,
      project_id: audit.project_id,
      row_id: audit.row_id,
      fk_model_id: audit.fk_model_id,
      op_type: audit.op_type,
      op_sub_type: audit.op_sub_type,
      status: audit.status,
      description: audit.description,
      details: audit.details
    });

    return this.get(id);
  }

  public static async commentsCount(args: {
    ids: string[];
    fk_model_id: string;
  }) {
    const audits = await Noco.ncMeta
      .knex(MetaTable.AUDIT)
      .count('id', { as: 'count' })
      .select('row_id')
      .whereIn('row_id', args.ids)
      .where('fk_model_id', args.fk_model_id)
      .groupBy('row_id');

    return audits?.map(a => new Audit(a));
  }
  public static async commentsList(args: CommentListParamsType) {
    const query = Noco.ncMeta
      .knex(MetaTable.AUDIT)
      .where('row_id', args.row_id)
      .where('fk_model_id', args.fk_model_id);

    if (args.comments_only) query.where('op_type', AuditOperationTypes.COMMENT);

    const audits = await query;

    return audits?.map(a => new Audit(a));
  }
}
