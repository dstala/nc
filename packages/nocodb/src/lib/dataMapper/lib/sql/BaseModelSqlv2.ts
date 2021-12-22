import autoBind from 'auto-bind';

import Model from '../../../noco-models/Model';
import { XKnex } from '../..';

/**
 * Base class for models
 *
 * @class
 * @classdesc Base class for models
 */
class BaseModelSqlv2 {
  protected dbDriver: XKnex;
  protected model: Model;

  constructor({ dbDriver, model }: { [key: string]: any; model: Model }) {
    this.dbDriver = dbDriver;

    this.model = model;
    autoBind(this);
  }

  public async nestedList(): Promise<any> {
    const qb = this.dbDriver(this.model.title);

    for (const col of await this.model.columnList()) {
      switch (col.uidt) {
        case 'LinkToAnotherRecord':
        case 'Lookup':
        case 'Formula':
          break;
        default:
          qb.select(this.dbDriver.raw(`?? as ??`, [col.cn, col._cn]));
          break;
      }
    }

    const data = await qb.limit(10);

    return data;

    /* const pk = columnsObj.actor.find(c => c.pk);
    const ids = data.map(r => r[pk._cn]);

    for (const col of columnsObj.actor) {
      switch (col.uidt) {
        case 'LinkToAnotherRecord':
          if (col.type === 'hm') {
            const children = await knex.union(
              ids.map(id => {
                const query = knex(col.rel_tn)
                  .where(col.rel_cn, id)
                  .limit(10);
                return query;
              }),
              true
            );

            const gb = children.reduce((gb, r) => {
              gb[r[col.rel_cn]] = gb[r[col.rel_cn]] || [];
              gb[r[col.rel_cn]].push(r);
              return gb;
            }, {});

            for (const d of data) {
              d[col._cn] = gb[d[pk._cn]];
            }
          }
          if (col.type === 'bt') {
            const parentIds = data
              .map(r => r[col._rel_cn])
              .filter(id => id !== null && id !== undefined);

            const parents = await knex(col.rel_tn).whereIn(
              col.rel_cn,
              parentIds
            );
            // .limit(10)

            const gb = parents.reduce((gb, r) => {
              gb[r[col.ref_rel_cn]] = r;
              return gb;
            }, {});

            for (const d of data) {
              d[col._cn] = gb[d[col._rel_cn]];
            }
          }

          if (col.type === 'mm') {
            const key = `${col.title}_${col.v_rel_cn}`;

            const childs = await knex.union(
              ids.map(id => {
                const query = knex(col.ref_rel_tn)
                  .join(
                    col.v_rel_tn,
                    `${col.v_rel_tn}.${col.v_ref_rel_cn}`,
                    `${col.ref_rel_tn}.${col.ref_rel_cn}`
                  )
                  .where(`${col.v_rel_tn}.${col.v_rel_cn}`, id) // p[this.columnToAlias?.[this.pks[0].cn] || this.pks[0].cn])
                  // .xwhere(where, this.dbModels[child].selectQuery(''))
                  .select({
                    [key]: `${col.v_rel_tn}.${col.v_rel_cn}`
                  })
                  .select(`${col.ref_rel_tn}.*`);

                // return this.isSqlite() ? driver.select().from(query) :
                return query;
              }),
              true
            );

            const gs = _.groupBy(childs, key);

            for (const d of data) {
              d[col._cn] = gs[d[pk._cn]];
            }
          }
          break;

        // todo: combine with LinkToAnotherRecord
        case 'Lookup':
          {
            let lkPk,
              prev,
              isArr = col.type !== 'bt';
            let field, lkQb;
            prev = col;
            if (col.type === 'hm') {
              // todo: decide based on type
              field = columnsObj[col.rel_tn].find(
                c => c.id === col.lookup_column_id
              );

              lkQb = knex(col.ref_rel_tn).join(
                col.rel_tn,
                `${col.rel_tn}.${col.rel_cn}`,
                `${col.ref_rel_tn}.${col.ref_rel_cn}`
              );

              lkPk = columnsObj[col.rel_tn]?.find(c => c.pk) || lkPk;
            } else if (col.type === 'bt') {
              // todo: decide based on type
              field = columnsObj[col.ref_rel_tn].find(
                c => c.id === col.lookup_column_id
              );

              lkQb = knex(col.rel_tn).join(
                col.ref_rel_tn,
                `${col.ref_rel_tn}.${col.ref_rel_cn}`,
                `${col.rel_tn}.${col.rel_cn}`
              );

              lkPk = columnsObj[col.ref_rel_tn]?.find(c => c.pk) || lkPk;
            } else if (col.type === 'mm') {
              // throw new Error('"m2m" lookup not implemented')

              // todo: decide based on type
              field = columnsObj[col.ref_rel_tn].find(
                c => c.id === col.lookup_column_id
              );

              lkQb = knex(col.rel_tn)
                .join(
                  col.v_rel_tn,
                  `${col.v_rel_tn}.${col.v_rel_cn}`,
                  `${col.rel_tn}.${col.rel_cn}`
                )
                .join(
                  col.ref_rel_tn,
                  `${col.v_rel_tn}.${col.v_ref_rel_cn}`,
                  `${col.ref_rel_tn}.${col.ref_rel_cn}`
                );

              lkPk = columnsObj[col.ref_rel_tn]?.find(c => c.pk) || lkPk;
            }

            while (field?.uidt === 'Lookup') {
              isArr = isArr || col.type !== 'bt';
              prev = field;

              if (field.type === 'hm') {
                lkQb.join(
                  field.rel_tn,
                  `${field.rel_tn}.${field.rel_cn}`,
                  `${field.ref_rel_tn}.${field.ref_rel_cn}`
                );
                lkPk = columnsObj[field.rel_tn]?.find(c => c.pk) || lkPk;
                field = columnsObj[field.rel_tn].find(
                  c => c.id === field.lookup_column_id
                );
              } else if (field.type === 'bt') {
                lkQb.join(
                  field.ref_rel_tn,
                  `${field.ref_rel_tn}.${field.ref_rel_cn}`,
                  `${field.rel_tn}.${field.rel_cn}`
                );
                lkPk = columnsObj[field.ref_rel_tn]?.find(c => c.pk) || lkPk;
                field = columnsObj[field.ref_rel_tn].find(
                  c => c.id === field.lookup_column_id
                );
              } else if (field.type === 'mm') {
                throw new Error('nested "m2m" lookup not implemented');
              }
            }

            // console.log(lkQb.toQuery())

            // check the look up column type
            //    if it's lookup
            //        construct query recursively
            //     else construct query

            const children = await knex.union(
              ids.map(id => {
                // lkQb.select(`${field.title}.${field.cn} as ${field._cn}`)

                let query;
                if (prev.type === 'hm') {
                  query = knex(`${field.title} as a`)
                    .select(
                      `a.${field.cn} as ${field._cn}`,
                      knex.raw('? as ??', [id, pk.cn])
                    )
                    .whereIn(
                      lkPk.cn,
                      lkQb
                        .clone()
                        .select(`${lkPk.title}.${lkPk.cn}`)
                        .where(`${col.ref_rel_tn}.${pk.cn}`, id)
                    )
                    .limit(10);
                } else if (prev.type === 'bt') {
                  query = knex(`${field.title} as a`)
                    .select(
                      `a.${field.cn} as ${field._cn}`,
                      knex.raw('? as ??', [id, pk.cn])
                    )
                    .whereIn(
                      prev.ref_rel_cn,
                      lkQb
                        .clone()
                        .select(`${prev.rel_tn}.${prev.rel_cn}`)
                        .where(`${pk.title}.${pk.cn}`, id)
                    )
                    .limit(10);
                } else if (prev.type === 'mm') {
                  // throw new Error('"m2m" lookup not implemented')

                  query = knex(`${field.title} as a`)
                    .select(
                      `a.${field.cn} as ${field._cn}`,
                      knex.raw('? as ??', [id, pk.cn])
                    )
                    .whereIn(
                      prev.ref_rel_cn,
                      lkQb
                        .clone()
                        .select(`${prev.v_rel_tn}.${prev.v_ref_rel_cn}`)
                        .where(`${col.rel_tn}.${pk.cn}`, id)
                    )
                    .limit(10);
                }

                console.log(query.toQuery());

                return query;
              }),
              true
            );

            const gb = children.reduce((gb, r) => {
              if (prev.type === 'hm') {
                gb[r[col.rel_cn]] = gb[r[col.rel_cn]] || [];
                gb[r[col.rel_cn]].push(r[field._cn]);
              } else if (prev.type === 'bt') {
                gb[r[pk.cn]] = gb[r[pk.cn]] || [];
                gb[r[pk.cn]].push(r[field._cn]);
              } else if (prev.type === 'mm') {
                // throw new Error('"m2m" lookup not implemented')
                gb[r[pk.cn]] = gb[r[pk.cn]] || [];
                gb[r[pk.cn]].push(r[field._cn]);
              }
              return gb;
            }, {});

            for (const d of data) {
              d[col._cn] = isArr
                ? gb[d[pk._cn]]
                : gb[d[pk._cn]] && gb[d[pk._cn]][0];
            }
          }
          break;
        case UITypes.Formula:
          break;
        default:
          break;
      }
    }*/
  }
}

export { BaseModelSqlv2 };
/**
 * @copyright Copyright (c) 2021, Xgene Cloud Ltd
 *
 * @author Naveen MR <oof1lab@gmail.com>
 * @author Pranav C Balan <pranavxc@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
