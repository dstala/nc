import jsep from 'jsep'


import {ColumnType} from "./Api";
export  function substituteColumnIdWithAliasInFormula(
  formula,
  columns: ColumnType[]
) {
  const substituteId =  (pt: any) => {
    if (pt.type === 'CallExpression') {
      // eslint-disable-next-line functional/no-loop-statement
      for (const arg of pt.arguments || []) {
         substituteId(arg);
      }
    } else if (pt.type === 'Literal') {
      return;
    } else if (pt.type === 'Identifier') {
      const colNameOrId = pt.name;
      const column = columns.find(
        c =>
          c.id === colNameOrId || c.column_name === colNameOrId || c.title === colNameOrId
      );
      // eslint-disable-next-line functional/immutable-data
      pt.name = column.title;
    } else if (pt.type === 'BinaryExpression') {
       substituteId(pt.left);
       substituteId(pt.right);
    }
  };

  const parsedFormula = jsep(formula);
  substituteId(parsedFormula);
  return jsepTreeToFormula(parsedFormula);
}

export function jsepTreeToFormula(node) {
  if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
    return (
      '(' +
      jsepTreeToFormula(node.left) +
      ' ' +
      node.operator +
      ' ' +
      jsepTreeToFormula(node.right) +
      ')'
    );
  }

  if (node.type === 'UnaryExpression') {
    return node.operator + jsepTreeToFormula(node.argument);
  }

  if (node.type === 'MemberExpression') {
    return (
      jsepTreeToFormula(node.object) +
      '[' +
      jsepTreeToFormula(node.property) +
      ']'
    );
  }

  if (node.type === 'Identifier') {
    return node.name;
  }

  if (node.type === 'Literal') {
    if (typeof node.value === 'string') {
      return '"' + node.value + '"';
    }

    return '' + node.value;
  }

  if (node.type === 'CallExpression') {
    return (
      jsepTreeToFormula(node.callee) +
      '(' +
      node.arguments.map(jsepTreeToFormula).join(', ') +
      ')'
    );
  }

  if (node.type === 'ArrayExpression') {
    return '[' + node.elements.map(jsepTreeToFormula).join(', ') + ']';
  }

  if (node.type === 'Compound') {
    return node.body.map(e => jsepTreeToFormula(e)).join(' ');
  }

  if (node.type === 'ConditionalExpression') {
    return (
      jsepTreeToFormula(node.test) +
      ' ? ' +
      jsepTreeToFormula(node.consequent) +
      ' : ' +
      jsepTreeToFormula(node.alternate)
    );
  }

  return '';
}
