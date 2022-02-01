/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  /** Unique identifier for the given user. */
  id: number;
  firstName: string;
  lastName: string;

  /** @format email */
  email: string;

  /**
   * @format date
   * @example 1997-10-31
   */
  dateOfBirth?: string;

  /** Set to true if the user's email has been verified. */
  emailVerified: boolean;

  /**
   * The date that the user was created.
   * @format date
   */
  createDate?: string;
}

export interface Project {
  id?: string;
  title?: string;
  status?: string;
  description?: string;
  meta?: string | object;
  color?: string;
  deleted?: string | boolean;
  order?: number;
  bases?: Base[];
}

export interface ProjectReq {
  title?: string;
  description?: string;
  color?: string;
  bases?: BaseReq[];
}

export interface Base {
  id?: string;
  project_id?: string;
  alias?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  url?: string;
  params?: string;
  type?: string;
  ssl?: string;
}

export interface BaseReq {
  alias?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  url?: string;
  params?: string;
  type?: string;
  ssl?: string;
}

export interface Table {
  id?: string;
  fk_project_id?: string;
  fk_base_id?: string;
  title: string;
  alias: string;
  type?: string;
  enabled?: string;
  parent_id?: string;
  show_as?: string;
  tags?: string;
  pinned?: boolean;
  deleted?: boolean;
  order?: number;
  column?: string | any[];
}

export interface Filter {
  id?: string;
  fk_model_id?: string;
  fk_column_id?: string;
  logical_op?: string;
  comparison_op?: string;
  value?: string | number | number | boolean | null;
  is_group?: boolean;
  children?: Filter[];
}

export interface Sort {
  id?: string;
  fk_model_id?: string;
  fk_column_id?: string;
  direction?: string;
  order?: number;
}

export interface Column {
  id?: string;
  base_id?: string;
  fk_model_id?: string;
  title?: string;
  alias?: string;
  ui_data_type?: string;
  data_type?: string;
  numeric_precision?: string;
  numeric_scale?: string;
  character_maximum_length?: string;
  column_ordinal_position?: string;
  primary_key?: string;
  primary_value?: string;
  rqd?: string;
  un?: string;
  column_type?: string;
  auto_increment?: string;
  unique?: string;
  column_default?: string;
  column_comment?: string;
  character_set_name?: string;
  data_type_x?: string;
  data_type_x_precision?: string;
  data_type_x_scale?: string;
  auto_update_timestamp?: boolean;
  deleted?: boolean;
  visible?: boolean;
  order?: number;
  colOptions?: LinkToAnotherRecord | Formula | Rollup | Lookup | SelectOptions[];
}

export interface LinkToAnotherRecord {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  fk_child_column_id?: string;
  fk_parent_column_id?: string;
  fk_mm_model_id?: string;
  fk_mm_child_column_id?: string;
  fk_mm_parent_column_id?: string;
  ur?: string;
  dr?: string;
  fk_index_name?: string;
  deleted?: string;
  order?: string;
}

export interface Lookup {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  fk_relation_column_id?: string;
  fk_lookup_column_id?: string;
  deleted?: string;
  order?: string;
}

export interface Rollup {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  fk_relation_column_id?: string;
  fk_rollup_column_id?: string;
  rollup_function?: string;
  deleted?: string;
  order?: string;
}

export interface Formula {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  formula?: string;
  deleted?: string;
  order?: string;
}

export interface SelectOptions {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  title?: string;
  color?: string;
  order?: number;
}

export interface SharedView {
  id?: string;
  fk_view_id?: string;
  password?: string;
  deleted?: string;
}

export interface Grid {
  id?: string;
  title?: string;
  alias?: string;
  deleted?: boolean;
  order?: number;
}

export interface Gallery {
  id?: string;
  title?: string;
  alias?: string;
  deleted?: boolean;
  order?: number;
  next_enabled?: boolean;
  prev_enabled?: boolean;
  cover_image_idx?: number;
  " cover_image"?: string;
  restrict_types?: string;
  restrict_size?: string;
  restrict_number?: string;
  public?: boolean;
  password?: string;
  show_all_fields?: boolean;
  columns?: GalleryColumn[];
  fk_model_id?: string;
}

export interface GalleryColumn {
  id?: string;
  label?: string;
  help?: string;
  fk_col_id?: string;
  fk_gallery_id?: string;
}

export interface Kanban {
  id?: string;
  title?: string;
  alias?: string;
  public?: boolean;
  password?: string;
  columns?: KanbanColumn[];
  fk_model_id?: string;
}

export interface KanbanColumn {
  id?: string;
  label?: string;
  help?: string;
  fk_column_id?: string;
  fk_kanban_id?: string;
}

export interface Form {
  id?: string;
  title?: string;
  alias?: string;
  order?: number;
  columns?: FormColumn[];
  fk_model_id?: string;
}

export interface FormColumn {
  id?: string;
  public?: boolean;
  password?: string;
  fk_column_id?: string;
  fk_form_id?: string;
}

export interface Paginated {
  pageSize?: number;
  totalRows?: number;
  sort?: string | any[];
  isFirstPage?: boolean;
  isLastPage?: boolean;
}

export interface ProjectList {
  projects: { list: Project[]; pageInfo: Paginated };
}

export interface TableList {
  tables: { list: Table[]; pageInfo: Paginated };
}

export interface BaseList {
  bases: { list: Base[]; pageInfo: Paginated };
}

export interface ColumnList {
  columns: { list: Column[] };
}

export interface FilterList {
  filters: { list: Filter[] };
}

export interface HookList {
  hooks: { list: object[]; pageInfo: Paginated };
}

export interface SharedViewList {
  sharedViews: { list: SharedView[]; pageInfo: Paginated };
}

export interface SortList {
  sorts: { list: SharedView[] };
}

export interface ViewList {
  sharedViews: { list: Grid | Form | Kanban | Gallery; pageInfo: Paginated };
}

export interface UserList {
  users: { list: User; pageInfo: Paginated };
}
