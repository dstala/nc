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
    switch (col.ui_data_type) {
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
                selectQb = knex(`${parentModel.title} as ${alias}`).where(
                  `${alias}.${parentColumn.title}`,
                  knex.raw(`??`, [`${childModel.title}.${childColumn.title}`])
                );
                break;
              case 'hm':
                isMany = true;
                selectQb = knex(`${childModel.title} as ${alias}`).where(
                  `${alias}.${childColumn.title}`,
                  knex.raw(`??`, [`${parentModel.title}.${parentColumn.title}`])
                );
                break;
              case 'mm':
                {
                  isMany = true;
                  const mmModel = await relation.getMMModel();
                  const mmParentColumn = await relation.getMMParentColumn();
                  const mmChildColumn = await relation.getMMChildColumn();

                  const assocAlias = `__nc${aliasCount++}`;
                  selectQb = knex(`${parentModel.title} as ${alias}`)
                    .join(
                      `${mmModel.title} as ${assocAlias}`,
                      `${assocAlias}.${mmParentColumn.title}`,
                      `${alias}.${parentColumn.title}`
                    )
                    .where(
                      `${assocAlias}.${mmChildColumn.title}`,
                      knex.raw(`??`, [
                        `${childModel.title}.${childColumn.title}`
                      ])
                    );
                }
                break;
            }

            let lookupColumn = await lookup.getLookupColumn();
            let prevAlias = alias;
            while (lookupColumn.ui_data_type === UITypes.Lookup) {
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
                      `${parentModel.title} as ${nestedAlias}`,
                      `${prevAlias}.${childColumn.title}`,
                      `${nestedAlias}.${parentColumn.title}`
                    );
                  }
                  break;
                case 'hm':
                  {
                    isMany = true;
                    selectQb.join(
                      `${childModel.title} as ${nestedAlias}`,
                      `${prevAlias}.${parentColumn.title}`,
                      `${nestedAlias}.${childColumn.title}`
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
                      `${mmModel.title} as ${assocAlias}`,
                      `${assocAlias}.${mmChildColumn.title}`,
                      `${prevAlias}.${childColumn.title}`
                    )
                    .join(
                      `${parentModel.title} as ${nestedAlias}`,
                      `${nestedAlias}.${parentColumn.title}`,
                      `${assocAlias}.${mmParentColumn.title}`
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

            switch (lookupColumn.ui_data_type) {
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
                          `${parentModel.title} as ${nestedAlias}`,
                          `${alias}.${childColumn.title}`,
                          `${nestedAlias}.${parentColumn.title}`
                        );
                        cn = knex.raw('??.??', [
                          nestedAlias,
                          parentModel?.primaryValue?.title
                        ]);
                      }
                      break;
                    case 'hm':
                      {
                        isMany = true;
                        selectQb.join(
                          `${childModel.title} as ${nestedAlias}`,
                          `${alias}.${parentColumn.title}`,
                          `${nestedAlias}.${childColumn.title}`
                        );
                        cn = knex.raw('??.??', [
                          nestedAlias,
                          childModel?.primaryValue?.title
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
                            `${mmModel.title} as ${assocAlias}`,
                            `${assocAlias}.${mmChildColumn.title}`,
                            `${alias}.${childColumn.title}`
                          )
                          .join(
                            `${parentModel.title} as ${nestedAlias}`,
                            `${nestedAlias}.${parentColumn.title}`,
                            `${assocAlias}.${mmParentColumn.title}`
                          );
                      }
                      cn = knex.raw('??.??', [
                        nestedAlias,
                        parentModel?.primaryValue?.title
                      ]);
                  }

                  selectQb.join(
                    `${parentModel.title} as ${nestedAlias}`,
                    `${nestedAlias}.${parentColumn.title}`,
                    `${prevAlias}.${childColumn.title}`
                  );

                  if (isMany) {
                    const qb = selectQb;
                    selectQb = fn =>
                      knex
                        .raw(
                          getAggregateFn(fn)({
                            qb,
                            knex,
                            cn: lookupColumn.title
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
                            cn: `${prevAlias}.${lookupColumn.title}`
                          })
                        )
                        .wrap('(', ')');
                  } else {
                    selectQb.select(`${prevAlias}.${lookupColumn.title}`);
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
            selectQb = knex(parentModel.title)
              .select(parentModel?.primaryValue?.title)
              .where(
                `${parentModel.title}.${parentColumn.title}`,
                knex.raw(`??`, [`${childModel.title}.${childColumn.title}`])
              );
          } else if (relation.type == 'hm') {
            const qb = knex(childModel.title)
              // .select(knex.raw(`GROUP_CONCAT(??)`, [childModel?.pv?.title]))
              .where(
                `${childModel.title}.${childColumn.title}`,
                knex.raw(`??`, [`${parentModel.title}.${parentColumn.title}`])
              );

            selectQb = fn =>
              knex
                .raw(
                  getAggregateFn(fn)({
                    qb,
                    knex,
                    cn: childModel?.primaryValue?.title
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

            const qb = knex(`${parentModel.title} as ${alias}`)
              .join(
                `${mmModel.title}`,
                `${mmModel.title}.${mmParentColumn.title}`,
                `${alias}.${parentColumn.title}`
              )
              .where(
                `${alias}.${parentColumn.title}`,
                knex.raw(`??`, [`${childModel.title}.${childColumn.title}`])
              );
            selectQb = fn =>
              knex
                .raw(
                  getAggregateFn(fn)({
                    qb,
                    knex,
                    cn: parentModel?.primaryValue?.title
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
        aliasToColumn[col.id] = col.title;
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
