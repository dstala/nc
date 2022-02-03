// Base class of Noco type
import Model from '../../noco-models/Model';
import NcMetaIO from '../meta/NcMetaIO';
// import { BaseModelSql } from '../../dataMapper';
import { NocoType } from './NocoTypeGenerator';
import { BaseModelSqlv2 } from '../../dataMapper/lib/sql/BaseModelSqlv2';

interface NocoTypeGeneratorCtx {
  ncMeta: NcMetaIO;
  types: {
    [tn: string]: any | NocoType;
  };
  // models: {
  //   [tn: string]: BaseModelSql;
  // };
  baseModels2: {
    [tn: string]: BaseModelSqlv2;
  };
}

export default class NocoTypeGenerator {
  public static async generate(models: Model[], ctx: NocoTypeGeneratorCtx) {
    const rootResolver = {};

    for (const model of models) {
      rootResolver[`${model._tn}List`] = async () => {
        // return (await ctx.models[model.title].list()).map(
        //   m => new ctx.types[model.title](m)
        // );x
        return await ctx.baseModels2[model.tn].list();
        //   .map(
        //   m => new ctx.types[model.title](m)
        // );
      };
      rootResolver[`${model._tn}Read`] = async id => {
        return await ctx.baseModels2[model.tn].readByPk(id);
        // return row ? new ctx.types[model.title](row) : null;
      };
    }

    return rootResolver;
  }
}
