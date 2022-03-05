import UITypes from "./UITypes";
import {RelationTypes} from "./globals";


const systemCols = ['created_at', 'updated_at']
const filterOutSystemColumns = (columns) => {
  return (columns && columns.filter(c => !(c.pk && c.ai) &&
    !((columns).some(c1 =>
      c1.uidt === UITypes.LinkToAnotherRecord &&
      c1.colOptions.type === RelationTypes.BELONGS_TO &&
      c.id === c1.colOptions.fk_child_column_id)) &&
    !systemCols.includes(c.cn))) || []
}
const getSystemColumnsIds = (columns) => {
  return ((columns && columns.filter(c => (c.pk && c.ai) ||((columns).some(c1 =>
      c1.uidt === UITypes.LinkToAnotherRecord &&
      c1.colOptions.type === RelationTypes.BELONGS_TO &&
      c.id === c1.colOptions.fk_child_column_id)) ||
    systemCols.includes(c.cn))) || []).map(c => c.id)
}


export {filterOutSystemColumns, getSystemColumnsIds}
