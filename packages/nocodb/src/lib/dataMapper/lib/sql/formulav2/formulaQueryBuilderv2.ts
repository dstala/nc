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

// @ts-ignore
const getAggregateFn: (
  fnName: string
) => (args: { qb; knex?; cn }) => any = parentFn => {
  switch (parentFn?.toUpperCase()) {
    case 'MIN':
      return ({ qb, cn }) => qb.clear('select').min(cn);
    case 'MAX':
      return ({ qb, cn }) => qb.clear('select').max(cn);
    case 'ADD':
    case 'SUM':
    case 'FLOAT':
    case 'NUMBER':
    case 'ARITH':
      return ({ qb, cn }) => qb.clear('select').sum(cn);

    case 'AVG':
      return ({ qb, cn }) => qb.clear('select').sum(cn);

    // todo:
    //   return ({ qb, cn, knex, argsCount }) =>
    //     qb
    //       .clear('select')
    //       .select(
    //         knex.raw('sum(??)/(count(??)) + ?)', [cn, cn, (argsCount || 1) - 1])
    //       );
    case 'CONCAT':
    default:
      return ({ qb, cn }) => qb.clear('select').concat(cn);
    // return '';
  }
};

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
          let aliasCount = 0;
          let selectQb;
          let isMany = false;
          const alias = `__nc_formula${aliasCount++}`;
          const lookup = await col.getColOptions<LookupColumn>();
          {
            const relationCol = await lookup.getRelationColumn();
            const relation = await relationCol.getColOptions<
              LinkToAnotherRecordColumn
            >();
            // if (relation.type !== 'bt') continue;

            const childColumn = await relation.getChildColumn();
            const parentColumn = await relation.getParentColumn();
            const childModel = await childColumn.getModel();
            await childModel.getColumns();
            const parentModel = await parentColumn.getModel();
            await parentModel.getColumns();
            switch (relation.type) {
              case 'bt':
                selectQb = knex(`${parentModel.tn} as ${alias}`).where(
                  `${alias}.${parentColumn.cn}`,
                  knex.raw(`??`, [`${childModel.tn}.${childColumn.cn}`])
                );
                break;
              case 'hm':
                isMany = true;
                selectQb = knex(`${childModel.tn} as ${alias}`).where(
                  `${alias}.${childColumn.cn}`,
                  knex.raw(`??`, [`${parentModel.tn}.${parentColumn.cn}`])
                );
                break;
              case 'mm':
                {
                  isMany = true;
                  const mmModel = await relation.getMMModel();
                  const mmParentColumn = await relation.getMMParentColumn();
                  const mmChildColumn = await relation.getMMChildColumn();

                  const assocAlias = `__nc${aliasCount++}`;
                  selectQb = knex(`${parentModel.tn} as ${alias}`)
                    .join(
                      `${mmModel.tn} as ${assocAlias}`,
                      `${assocAlias}.${mmParentColumn.cn}`,
                      `${alias}.${parentColumn.cn}`
                    )
                    .where(
                      `${assocAlias}.${mmChildColumn.cn}`,
                      knex.raw(`??`, [`${childModel.tn}.${childColumn.cn}`])
                    );
                }
                break;
            }

            let lookupColumn = await lookup.getLookupColumn();
            let prevAlias = alias;
            while (lookupColumn.uidt === UITypes.Lookup) {
              const nestedAlias = `__nc_formula${aliasCount++}`;
              const nestedLookup = await lookupColumn.getColOptions<
                LookupColumn
              >();
              const relationCol = await nestedLookup.getRelationColumn();
              const relation = await relationCol.getColOptions<
                LinkToAnotherRecordColumn
              >();
              // if any of the relation in nested lookup is
              // not belongs to then ignore the sort option
              // if (relation.type !== 'bt') continue;

              const childColumn = await relation.getChildColumn();
              const parentColumn = await relation.getParentColumn();
              const childModel = await childColumn.getModel();
              await childModel.getColumns();
              const parentModel = await parentColumn.getModel();
              await parentModel.getColumns();

              switch (relation.type) {
                case 'bt':
                  {
                    selectQb.join(
                      `${parentModel.tn} as ${nestedAlias}`,
                      `${prevAlias}.${childColumn.cn}`,
                      `${nestedAlias}.${parentColumn.cn}`
                    );
                  }
                  break;
                case 'hm':
                  {
                    isMany = true;
                    selectQb.join(
                      `${childModel.tn} as ${nestedAlias}`,
                      `${prevAlias}.${parentColumn.cn}`,
                      `${nestedAlias}.${childColumn.cn}`
                    );
                  }
                  break;
                case 'mm': {
                  isMany = true;
                  const mmModel = await relation.getMMModel();
                  const mmParentColumn = await relation.getMMParentColumn();
                  const mmChildColumn = await relation.getMMChildColumn();

                  const assocAlias = `__nc${aliasCount++}`;

                  selectQb
                    .join(
                      `${mmModel.tn} as ${assocAlias}`,
                      `${assocAlias}.${mmChildColumn.cn}`,
                      `${prevAlias}.${childColumn.cn}`
                    )
                    .join(
                      `${parentModel.tn} as ${nestedAlias}`,
                      `${nestedAlias}.${parentColumn.cn}`,
                      `${assocAlias}.${mmParentColumn.cn}`
                    );
                }
              }

              /*selectQb.join(
`${parentModel.title} as ${nestedAlias}`,
`${nestedAlias}.${parentColumn.title}`,
`${prevAlias}.${childColumn.title}`
);*/

              lookupColumn = await nestedLookup.getLookupColumn();
              prevAlias = nestedAlias;
            }

            switch (lookupColumn.uidt) {
              case UITypes.Rollup:
                {
                  const builder = (
                    await genRollupSelectv2({
                      knex,
                      alias: prevAlias,
                      columnOptions: (await lookupColumn.getColOptions()) as RollupColumn
                    })
                  ).builder;
                  // selectQb.select(builder);

                  if (isMany) {
                    const qb = selectQb;
                    selectQb = fn =>
                      knex
                        .raw(
                          getAggregateFn(fn)({
                            qb,
                            knex,
                            cn: knex.raw(builder).wrap('(', ')')
                          })
                        )
                        .wrap('(', ')');
                  } else {
                    selectQb.select(builder);
                  }
                }
                break;
              case UITypes.LinkToAnotherRecord:
                {
                  const nestedAlias = `__nc_formula${aliasCount++}`;
                  const relation = await lookupColumn.getColOptions<
                    LinkToAnotherRecordColumn
                  >();
                  // if (relation.type !== 'bt') continue;

                  const colOptions = (await col.getColOptions()) as LinkToAnotherRecordColumn;
                  const childColumn = await colOptions.getChildColumn();
                  const parentColumn = await colOptions.getParentColumn();
                  const childModel = await childColumn.getModel();
                  await childModel.getColumns();
                  const parentModel = await parentColumn.getModel();
                  await parentModel.getColumns();
                  let cn;
                  switch (relation.type) {
                    case 'bt':
                      {
                        selectQb.join(
                          `${parentModel.tn} as ${nestedAlias}`,
                          `${alias}.${childColumn.cn}`,
                          `${nestedAlias}.${parentColumn.cn}`
                        );
                        cn = knex.raw('??.??', [
                          nestedAlias,
                          parentModel?.primaryValue?.cn
                        ]);
                      }
                      break;
                    case 'hm':
                      {
                        isMany = true;
                        selectQb.join(
                          `${childModel.tn} as ${nestedAlias}`,
                          `${alias}.${parentColumn.cn}`,
                          `${nestedAlias}.${childColumn.cn}`
                        );
                        cn = knex.raw('??.??', [
                          nestedAlias,
                          childModel?.primaryValue?.cn
                        ]);
                      }
                      break;
                    case 'mm':
                      {
                        isMany = true;
                        const mmModel = await relation.getMMModel();
                        const mmParentColumn = await relation.getMMParentColumn();
                        const mmChildColumn = await relation.getMMChildColumn();

                        const assocAlias = `__nc${aliasCount++}`;

                        selectQb
                          .join(
                            `${mmModel.tn} as ${assocAlias}`,
                            `${assocAlias}.${mmChildColumn.cn}`,
                            `${alias}.${childColumn.cn}`
                          )
                          .join(
                            `${parentModel.tn} as ${nestedAlias}`,
                            `${nestedAlias}.${parentColumn.cn}`,
                            `${assocAlias}.${mmParentColumn.cn}`
                          );
                      }
                      cn = knex.raw('??.??', [
                        nestedAlias,
                        parentModel?.primaryValue?.cn
                      ]);
                  }

                  selectQb.join(
                    `${parentModel.tn} as ${nestedAlias}`,
                    `${nestedAlias}.${parentColumn.cn}`,
                    `${prevAlias}.${childColumn.cn}`
                  );

                  if (isMany) {
                    const qb = selectQb;
                    selectQb = fn =>
                      knex
                        .raw(
                          getAggregateFn(fn)({
                            qb,
                            knex,
                            cn: lookupColumn.cn
                          })
                        )
                        .wrap('(', ')');
                  } else {
                    selectQb.select(`${prevAlias}.${cn}`);
                  }
                }
                break;
              case UITypes.Formula:
                {
                  const formulaOption = await lookupColumn.getColOptions<
                    FormulaColumn
                  >();
                  const lookupModel = await lookupColumn.getModel();
                  const { builder } = await formulaQueryBuilderv2(
                    formulaOption.formula,
                    '',
                    knex,
                    lookupModel,
                    aliasToColumn
                  );
                  if (isMany) {
                    const qb = selectQb;
                    selectQb = fn =>
                      knex
                        .raw(
                          getAggregateFn(fn)({
                            qb,
                            knex,
                            cn: knex.raw(builder).wrap('(', ')')
                          })
                        )
                        .wrap('(', ')');
                  } else {
                    selectQb.select(builder);
                  }
                }
                break;
              default:
                {
                  if (isMany) {
                    const qb = selectQb;
                    selectQb = fn =>
                      knex
                        .raw(
                          getAggregateFn(fn)({
                            qb,
                            knex,
                            cn: `${prevAlias}.${lookupColumn.cn}`
                          })
                        )
                        .wrap('(', ')');
                  } else {
                    selectQb.select(`${prevAlias}.${lookupColumn.cn}`);
                  }
                }

                break;
            }

            if (selectQb)
              aliasToColumn[col.id] =
                typeof selectQb === 'function'
                  ? selectQb
                  : knex.raw(selectQb as any).wrap('(', ')');
          }
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
            selectQb = knex(parentModel.tn)
              .select(parentModel?.primaryValue?.cn)
              .where(
                `${parentModel.tn}.${parentColumn.cn}`,
                knex.raw(`??`, [`${childModel.tn}.${childColumn.cn}`])
              );
          } else if (relation.type == 'hm') {
            const qb = knex(childModel.tn)
              // .select(knex.raw(`GROUP_CONCAT(??)`, [childModel?.pv?.title]))
              .where(
                `${childModel.tn}.${childColumn.cn}`,
                knex.raw(`??`, [`${parentModel.tn}.${parentColumn.cn}`])
              );

            selectQb = fn =>
              knex
                .raw(
                  getAggregateFn(fn)({
                    qb,
                    knex,
                    cn: childModel?.primaryValue?.cn
                  })
                )
                .wrap('(', ')');

            // getAggregateFn();
          } else if (relation.type == 'mm') {
            // todo:
            // const qb = knex(childModel.title)
            //   // .select(knex.raw(`GROUP_CONCAT(??)`, [childModel?.pv?.title]))
            //   .where(
            //     `${childModel.title}.${childColumn.title}`,
            //     knex.raw(`??`, [`${parentModel.title}.${parentColumn.title}`])
            //   );
            //
            // selectQb = fn =>
            //   knex
            //     .raw(
            //       getAggregateFn(fn)({
            //         qb,
            //         knex,
            //         cn: childModel?.pv?.title
            //       })
            //     )
            //     .wrap('(', ')');
            //
            // // getAggregateFn();

            const mmModel = await relation.getMMModel();
            const mmParentColumn = await relation.getMMParentColumn();
            // const mmChildColumn = await relation.getMMChildColumn();

            const qb = knex(`${parentModel.tn} as ${alias}`)
              .join(
                `${mmModel.tn}`,
                `${mmModel.tn}.${mmParentColumn.cn}`,
                `${alias}.${parentColumn.cn}`
              )
              .where(
                `${alias}.${parentColumn.cn}`,
                knex.raw(`??`, [`${childModel.tn}.${childColumn.cn}`])
              );
            selectQb = fn =>
              knex
                .raw(
                  getAggregateFn(fn)({
                    qb,
                    knex,
                    cn: parentModel?.primaryValue?.cn
                  })
                )
                .wrap('(', ')');
          }
          if (selectQb)
            aliasToColumn[col.id] =
              typeof selectQb === 'function'
                ? selectQb
                : knex.raw(selectQb as any).wrap('(', ')');
        }
        break;
      default:
        aliasToColumn[col.id] = col.cn;
        break;
    }
  }

  const fn = (pt, a?, prevBinaryOp?) => {
    const colAlias = a ? ` as ${a}` : '';
    pt.arguments?.forEach?.(arg => {
      if (arg.fnName) return;
      arg.fnName = pt.callee.name;
      arg.argsCount = pt.arguments?.length;
    });
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
      if (typeof aliasToColumn?.[pt.name] === 'function') {
        return knex.raw(`??${colAlias}`, aliasToColumn?.[pt.name](pt.fnName));
      }
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
      pt.left.fnName = pt.left.fnName || 'ARITH';
      pt.right.fnName = pt.right.fnName || 'ARITH';

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
