import UITypes from "./UITypes";
// import {RelationTypes} from "./globals";


// const systemCols = ['created_at', 'updated_at']
const filterOutSystemColumns = (columns) => {
  return (columns && columns.filter(c => !isSystemColumn(c))) || []
}
const getSystemColumnsIds = (columns) => {
  return ((columns && columns.filter(isSystemColumn)) || []).map(c => c.id)
}



const getSystemColumns = (columns) =>
  ((columns.filter(isSystemColumn)) || [])

const isSystemColumn = (col) =>
  col.uidt === UITypes.ForeignKey ||
  col.cn === 'created_at' ||
  col.cn === 'updated_at' ||
  (col.pk && (col.ai || col.cdf)
    || col.system
  )


export {filterOutSystemColumns, getSystemColumnsIds, getSystemColumns,isSystemColumn}
