// Base class of Noco type
import Model from '../../noco-models/Model';
import UITypes from '../../sqlUi/UITypes';
import LookupColumn from '../../noco-models/LookupColumn';
import RollupColumn from '../../noco-models/RollupColumn';
import LinkToAnotherRecordColumn from '../../noco-models/LinkToAnotherRecordColumn';
import NcMetaIO from '../meta/NcMetaIO';
import DataLoader from 'dataloader';
import { BaseModelSql } from '../../dataMapper';
import Column from '../../noco-models/Column';

const groupBy = (arr, field) => {
  return (arr || []).reduce((obj, o) => {
    obj[o[field]] = obj[o[field]] || [];
    obj[o[field]].push(o);
    return obj;
  }, {});
};

class NocoType {
  constructor(o) {
    for (const k in o) {
      if (!this[k]) {
        this[k] = o[k];
      }
    }
  }
}

interface NocoTypeGeneratorCtx {
  ncMeta: NcMetaIO;
  models: {
    [tn: string]: BaseModelSql;
  };
}

export default class NocoTypeGenerator {
  public static async generate(models: Model[], ctx: NocoTypeGeneratorCtx) {
    const types = {};
    const generateNestedPropCallback = [];
    const generateColRefCallback = [];
    const modelsRef: { [id: string]: Model } = models.reduce((obj, m) => {
      obj[m.id] = m;
      return obj;
    }, {});
    const columnsRef: { [id: string]: Column } = {};

    for (const model of models) {
      const type = class extends NocoType {
        public static __columnAliases = {};
      };
      types[model.title] = type;
      generateColRefCallback.push(async function() {
        for (const column of await model.loadColumns()) {
          columnsRef[column.id] = column;
        }
      });

      generateNestedPropCallback.push(async function() {
        for (const column of await model.loadColumns()) {
          switch (column.uidt) {
            case UITypes.Rollup:
              {
                // @ts-ignore
                const colOptions: RollupColumn = await column.loadColOptions();
              }
              break;
            case UITypes.Lookup:
              {
                // @ts-ignore
                const colOptions: LookupColumn = await column.loadColOptions();
                type.__columnAliases[column._cn] = {
                  path: [
                    columnsRef[colOptions.fk_relation_column_id]._cn,
                    columnsRef[colOptions.fk_lookup_column_id]._cn
                  ]
                };
              }
              break;
            case UITypes.LinkToAnotherRecord:
              {
                const colOptions = (await column.loadColOptions()) as LinkToAnotherRecordColumn;

                console.log(`${column._cn}\t\t::\t\t${colOptions.type}`);

                if (colOptions?.type === 'hm') {
                  const countLoader = new DataLoader(async (ids: string[]) => {
                    const data = await ctx.models[model.title].hasManyListCount(
                      {
                        child:
                          modelsRef[
                            columnsRef[colOptions.fk_child_column_id]
                              .fk_model_id
                          ].title,
                        ids
                      }
                    );
                    return data;
                  });

                  // defining HasMany count method within GQL Type class
                  Object.defineProperty(
                    type.prototype,
                    `${
                      modelsRef[
                        columnsRef[colOptions.fk_child_column_id]?.fk_model_id
                      ]?.title
                    }Count`,
                    // column._cn,
                    {
                      async value(): Promise<any> {
                        return countLoader.load(this[model.pk._cn]);
                      },
                      configurable: true
                    }
                  );

                  const listLoader = new DataLoader(async (ids: string[]) => {
                    try {
                      const data = await ctx.models[model.title].hasManyListGQL(
                        {
                          child:
                            modelsRef[
                              columnsRef[colOptions.fk_child_column_id]
                                .fk_model_id
                            ].title,
                          ids
                        }
                      );
                      return ids.map((id: string) =>
                        data[id]
                          ? data[id].map(
                              c =>
                                new types[
                                  modelsRef[
                                    columnsRef[
                                      colOptions.fk_child_column_id
                                    ].fk_model_id
                                  ].title
                                ](c)
                            )
                          : []
                      );
                    } catch (e) {
                      console.log(e);
                      return [];
                    }
                  });

                  // defining HasMany count method within GQL Type class
                  Object.defineProperty(type.prototype, column._cn, {
                    async value(): Promise<any> {
                      return listLoader.load(this[model.pk._cn]);
                    },
                    configurable: true
                  });
                } else if (colOptions.type === 'mm') {
                  const listLoader = new DataLoader(async (ids: string[]) => {
                    try {
                      const data = await ctx.models[
                        model.title
                      ]._getGroupedManyToManyList({
                        parentIds: ids,
                        child:
                          modelsRef[
                            columnsRef[colOptions.fk_parent_column_id]
                              .fk_model_id
                          ].title,
                        // todo: optimize - query only required fields
                        rest: {
                          mfields1: '*'
                        }
                      });
                      return ids.map((id: string) =>
                        data[id]
                          ? data[id].map(
                              c =>
                                new types[
                                  modelsRef[
                                    columnsRef[
                                      colOptions.fk_parent_column_id
                                    ].fk_model_id
                                  ].title
                                ](c)
                            )
                          : []
                      );
                    } catch (e) {
                      console.log(e);
                      return [];
                    }
                  });

                  Object.defineProperty(type.prototype, column._cn, {
                    async value(): Promise<any> {
                      return listLoader.load(this[model.pk._cn]);
                    },
                    configurable: true
                  });
                } else if (colOptions.type === 'bt') {
                  // @ts-ignore
                  const colOptions = (await column.loadColOptions()) as LinkToAnotherRecordColumn;
                  const countLoader = new DataLoader(async (ids: string[]) => {
                    try {
                      const data = await ctx.models[
                        modelsRef[
                          columnsRef[colOptions.fk_parent_column_id].fk_model_id
                        ].title
                      ].list({
                        limit: ids.length,
                        where: `(${
                          columnsRef[colOptions.fk_parent_column_id].cn
                        },in,${ids.join(',')})`
                      });
                      const gs = groupBy(
                        data,
                        columnsRef[colOptions.fk_parent_column_id]._cn
                      );
                      return ids.map(
                        async (id: string) =>
                          gs?.[id]?.[0] &&
                          new types[
                            modelsRef[
                              columnsRef[
                                colOptions.fk_parent_column_id
                              ].fk_model_id
                            ].title
                          ](gs[id][0])
                      );
                    } catch (e) {
                      console.log(e);
                      return [];
                    }
                  });

                  // defining HasMany count method within GQL Type class
                  Object.defineProperty(type.prototype, column._cn, {
                    async value(): // args: any,
                    // context: any,
                    // info: any
                    Promise<any> {
                      return countLoader.load(
                        this[columnsRef[colOptions.fk_parent_column_id]._cn]
                      );
                    },
                    configurable: true
                  });
                }

                // todo : handle mm
              }
              break;
            // case UITypes.ForeignKey:
            //
            //   break;
          }
        }
      });
    }
    await Promise.all(generateColRefCallback.map(f => f()));
    await Promise.all(generateNestedPropCallback.map(f => f()));
    return types;
  }
}

export { NocoType };
