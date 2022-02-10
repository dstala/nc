import Column from '../../../../noco-models/Column';

export function getUniqueColumnName(columns: Column[], initialName = 'field') {
  let c = 0;

  while (columns.some(col => col.cn === `${initialName}${c || ''}`)) {
    c++;
  }

  return `${initialName}${c || ''}`;
}

export function getUniqueColumnAliasName(
  columns: Column[],
  initialName = 'field'
) {
  let c = 0;

  while (columns.some(col => col._cn === `${initialName}${c || ''}`)) {
    c++;
  }

  return `${initialName}${c || ''}`;
}
