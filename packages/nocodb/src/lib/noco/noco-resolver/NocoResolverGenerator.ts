// Base class of Noco type
import Model from '../../noco-models/Model';
import NcMetaIO from '../meta/NcMetaIO';
import { BaseModelSql } from '../../dataMapper';
import { NocoType } from './NocoTypeGenerator';

interface NocoTypeGeneratorCtx {
  ncMeta: NcMetaIO;
  types: {
    [tn: string]: any | NocoType;
  };
  models: {
    [tn: string]: BaseModelSql;
  };
}

export default class NocoTypeGenerator {
  public static async generate(models: Model[], ctx: NocoTypeGeneratorCtx) {
    const rootResolver = {};

    for (const model of models) {
      rootResolver[`${model.alias}List`] = async () => {
        return (await ctx.models[model.title].list()).map(
          m => new ctx.types[model.title](m)
        );
      };
      rootResolver[`${model.alias}Read`] = async id => {
        const row = await ctx.models[model.title].readByPk(id);
        return row ? new ctx.types[model.title](row) : null;
      };
    }

    return rootResolver;
  }
}
