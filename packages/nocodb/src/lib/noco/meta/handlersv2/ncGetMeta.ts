import { NcContextV2 } from '../NcMetaMgrv2';
import Model from '../../../noco-models/Model';

export default async function(this: NcContextV2, { args }: any) {
  const meta = await Model.get({
    base_id: this.projectId,
    db_alias: this.dbAlias,
    tn: args.tn
  });
  await meta.getColumns();

  return meta;
}
