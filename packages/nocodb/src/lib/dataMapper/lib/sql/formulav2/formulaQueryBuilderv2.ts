import jsep from 'jsep';
import mapFunctionName from '../mapFunctionName';
import Model from '../../../../noco-models/Model';
import UITypes from '../../../../sqlUi/UITypes';
import genRollupSelectv2 from '../genRollupSelectv2';
import RollupColumn from '../../../../noco-models/RollupColumn';
import FormulaColumn from '../../../../noco-models/FormulaColumn';
import { XKnex } from '../../..';
import LinkToAnotherRecordColumn from '../../../../noco-models/LinkToAnotherRecordColumn';
import LookupColumn from '../../../../noco-models/LookupColumn';

// todo: switch function based on database

export default async function formulaQueryBuilderv2(
  _tree,
  alias,
  knex: XKnex,
  model: Model,
  aliasToColumn = {}
) {
  const tree = jsep(_tree);

  // todo: improve - implement a common solution for filter, sort, formula, etc
  for (const col of await model.getColumns()) {
    if (col.id in aliasToColumn) continue;
    switch (col.uidt) {
      case UITypes.Formula:
        {
          aliasToColumn[col.id] = null;
          const formulOption = await col.getColOptions<FormulaColumn>();
          const { builder } = await formulaQueryBuilderv2(
            formulOption.formula,
            alias,
            knex,
            model,
            aliasToColumn
          );
          aliasToColumn[col.id] = builder;
        }
        break;
      case UITypes.Lookup:
        {
          let aliasCount = 0,
            selectQb;
          const alias = `__nc_sort${aliasCount++}`;
          const lookup = await col.getColOptions<LookupColumn>();
          {
            const relationCol = await lookup.getRelationColumn();
            const relation = await relationCol.getColOptions<
              LinkToAnotherRecordColumn
            >();
            if (relation.type !== 'bt') continue;

            const childColumn = await relation.getChildColumn();
            const parentColumn = await relation.getParentColumn();
            const childModel = await childColumn.getModel();
            await childModel.getColumns();
            const parentModel = await parentColumn.getModel();
            await parentModel.getColumns();

            selectQb = knex(`${parentModel.title} as ${alias}`).where(
              `${alias}.${parentColumn.cn}`,
              knex.raw(`??`, [`${childModel.title}.${childColumn.cn}`])
            );
          }
          let lookupColumn = await lookup.getLookupColumn();
          let prevAlias = alias;
          while (lookupColumn.uidt === UITypes.Lookup) {
            const nestedAlias = `__nc_sort${aliasCount++}`;
            const nestedLookup = await lookupColumn.getColOptions<
              LookupColumn
            >();
            const relationCol = await nestedLookup.getRelationColumn();
            const relation = await relationCol.getColOptions<
              LinkToAnotherRecordColumn
            >();
            // if any of the relation in nested lookup is
            // not belongs to then ignore the sort option
            if (relation.type !== 'bt') continue;

            const childColumn = await relation.getChildColumn();
            const parentColumn = await relation.getParentColumn();
            const childModel = await childColumn.getModel();
            await childModel.getColumns();
            const parentModel = await parentColumn.getModel();
            await parentModel.getColumns();

            selectQb.join(
              `${parentModel.title} as ${nestedAlias}`,
              `${nestedAlias}.${parentColumn.cn}`,
              `${prevAlias}.${childColumn.cn}`
            );

            lookupColumn = await nestedLookup.getLookupColumn();
            prevAlias = nestedAlias;
          }

          switch (lookupColumn.uidt) {
            case UITypes.Rollup:
              {
                const builder = (
                  await genRollupSelectv2({
                    knex,
                    columnOptions: (await lookupColumn.getColOptions()) as RollupColumn
                  })
                ).builder;
                selectQb.select(builder);
              }
              break;
            case UITypes.LinkToAnotherRecord:
              {
                const nestedAlias = `__nc_sort${aliasCount++}`;
                const relation = await lookupColumn.getColOptions<
                  LinkToAnotherRecordColumn
                >();
                if (relation.type !== 'bt') continue;

                const colOptions = (await col.getColOptions()) as LinkToAnotherRecordColumn;
                const childColumn = await colOptions.getChildColumn();
                const parentColumn = await colOptions.getParentColumn();
                const childModel = await childColumn.getModel();
                await childModel.getColumns();
                const parentModel = await parentColumn.getModel();
                await parentModel.getColumns();

                selectQb
                  .join(
                    `${parentModel.title} as ${nestedAlias}`,
                    `${nestedAlias}.${parentColumn.cn}`,
                    `${prevAlias}.${childColumn.cn}`
                  )
                  .select(parentModel?.pv?.cn);
              }
              break;
            case UITypes.Formula:
              {
              }
              break;
            default:
              {
                selectQb.select(`${prevAlias}.${lookupColumn.cn}`);
              }

              break;
          }

          if (selectQb)
            aliasToColumn[col.id] = knex.raw(selectQb as any).wrap('(', ')');
        }
        break;
      case UITypes.Rollup:
        aliasToColumn[col.id] = knex
          .raw(
            (
              await genRollupSelectv2({
                knex,
                columnOptions: (await col.getColOptions()) as RollupColumn
              })
            ).builder
          )
          .wrap('(', ')');

        break;
      case UITypes.LinkToAnotherRecord:
        {
          const relation = await col.getColOptions<LinkToAnotherRecordColumn>();
          // if (relation.type !== 'bt') continue;

          const colOptions = (await col.getColOptions()) as LinkToAnotherRecordColumn;
          const childColumn = await colOptions.getChildColumn();
          const parentColumn = await colOptions.getParentColumn();
          const childModel = await childColumn.getModel();
          await childModel.getColumns();
          const parentModel = await parentColumn.getModel();
          await parentModel.getColumns();

          let selectQb;
          if (relation.type === 'bt') {
            selectQb = knex(parentModel.title)
              .select(parentModel?.pv?.cn)
              .where(
                `${parentModel.title}.${parentColumn.cn}`,
                knex.raw(`??`, [`${childModel.title}.${childColumn.cn}`])
              );
          } else if (relation.type == 'hm') {
            selectQb = knex(childModel.title)
              .select(childModel?.pv?.cn)
              .where(
                `${childModel.title}.${childColumn.cn}`,
                knex.raw(`??`, [`${parentModel.title}.${parentColumn.cn}`])
              );
          }
          if (selectQb)
            aliasToColumn[col.id] = knex.raw(selectQb as any).wrap('(', ')');
        }
        break;
      default:
        aliasToColumn[col.id] = col.cn;
        break;
    }
  }

  const fn = (pt, a?, prevBinaryOp?) => {
    const colAlias = a ? ` as ${a}` : '';
    if (pt.type === 'CallExpression') {
      switch (pt.callee.name) {
        case 'ADD':
        case 'SUM':
          if (pt.arguments.length > 1) {
            return fn(
              {
                type: 'BinaryExpression',
                operator: '+',
                left: pt.arguments[0],
                right: { ...pt, arguments: pt.arguments.slice(1) }
              },
              a,
              prevBinaryOp
            );
          } else {
            return fn(pt.arguments[0], a, prevBinaryOp);
          }
          break;
        // case 'AVG':
        //   if (pt.arguments.length > 1) {
        //     return fn({
        //       type: 'BinaryExpression',
        //       operator: '/',
        //       left: {...pt, callee: {name: 'SUM'}},
        //       right: {type: 'Literal', value: pt.arguments.length}
        //     }, a, prevBinaryOp)
        //   } else {
        //     return fn(pt.arguments[0], a, prevBinaryOp)
        //   }
        //   break;
        case 'CONCAT':
          if (knex.clientType() === 'sqlite3') {
            if (pt.arguments.length > 1) {
              return fn(
                {
                  type: 'BinaryExpression',
                  operator: '||',
                  left: pt.arguments[0],
                  right: { ...pt, arguments: pt.arguments.slice(1) }
                },
                a,
                prevBinaryOp
              );
            } else {
              return fn(pt.arguments[0], a, prevBinaryOp);
            }
          }
          break;
        default:
          {
            const res = mapFunctionName({
              pt,
              knex,
              alias,
              a,
              aliasToCol: aliasToColumn,
              fn,
              colAlias,
              prevBinaryOp
            });
            if (res) return res;
          }
          break;
      }

      return knex.raw(
        `${pt.callee.name}(${pt.arguments
          .map(arg => fn(arg).toQuery())
          .join()})${colAlias}`
      );
    } else if (pt.type === 'Literal') {
      return knex.raw(`?${colAlias}`, [pt.value]);
    } else if (pt.type === 'Identifier') {
      return knex.raw(`??${colAlias}`, [aliasToColumn?.[pt.name] || pt.name]);
    } else if (pt.type === 'BinaryExpression') {
      if (pt.operator === '==') {
        pt.operator = '=';
      }

      if (pt.operator === '/') {
        pt.left = {
          callee: { name: 'FLOAT' },
          type: 'CallExpression',
          arguments: [pt.left]
        };
      }

      const query = knex.raw(
        `${fn(pt.left, null, pt.operator).toQuery()} ${pt.operator} ${fn(
          pt.right,
          null,
          pt.operator
        ).toQuery()}${colAlias}`
      );
      if (prevBinaryOp && pt.operator !== prevBinaryOp) {
        query.wrap('(', ')');
      }
      return query;
    }
  };
  return { builder: fn(tree, alias) };
}
