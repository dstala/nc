import inflection from 'inflection';

export default function getTableNameAlias(tableName: string, prefix): string {
  let tn = tableName;
  if (prefix) {
    tn = tn.replace(prefix, '');
  }

  return inflection.camelize(tn);
}

export function getColumnNameAlias(columnName: string): string {
  return inflection.camelize(columnName);
}
