export enum ViewTypes {
  FORM = 1,
  GALLERY = 2,
  GRID = 3,
  KANBAN = 4
}
export enum RelationTypes {
  HAS_MANY = 'hm',
  BELONGS_TO = 'bt',
  MANY_TO_MANY = 'mm'
}


export enum ExportTypes {
  CSV = 'csv'
}


export enum ErrorMessages {
  INVALID_SHARED_VIEW_PASSWORD = 'INVALID_SHARED_VIEW_PASSWORD',
NOT_IMPLEMENTED='NOT_IMPLEMENTED',
}


export enum AuditOperationTypes {
  COMMENT='COMMENT',
  DATA='DATA',
}
export enum AuditOperationSubTypes {
  UPDATE='UPDATE',
  INSERT='INSERT',
  DELETE='DELETE',
}
