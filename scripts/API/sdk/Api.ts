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

export interface UserList {
  users: { list: User; pageInfo: Paginated };
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

export interface ProjectList {
  projects: { list: Project[]; pageInfo: Paginated };
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

export interface BaseList {
  bases: { list: Base[]; pageInfo: Paginated };
}

export interface Table {
  id?: string;
  fk_project_id?: string;
  fk_base_id?: string;
  title: string;
  alias: string;
  type?: string;
  enabled?: boolean;
  parent_id?: string;
  show_as?: string;
  tags?: string;
  pinned?: boolean;
  deleted?: boolean;
  order?: number;
  column?: Column[];
  columnsById?: object;
}

export interface TableInfo {
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
  column?: Column[];
  filters?: Filter[];
  sort?: Sort[];
}

export interface TableReq {
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

export interface TableList {
  tables: { list: Table[]; pageInfo: Paginated };
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

export interface FilterList {
  filters: { list: Filter[] };
}

export interface Sort {
  id?: string;
  fk_model_id?: string;
  fk_column_id?: string;
  direction?: string;
  order?: number;
}

export interface SortList {
  sorts: { list: SharedView[] };
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
  primary_key?: boolean;
  primary_value?: boolean;
  rqd?: string;
  un?: string;
  column_type?: string;
  auto_increment?: boolean;
  unique?: boolean;
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

export interface ColumnList {
  columns: { list: Column[] };
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

export interface KanbanColumn {
  id?: string;
  label?: string;
  help?: string;
  fk_column_id?: string;
  fk_kanban_id?: string;
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
  page?: number;
}

export interface HookList {
  hooks: { list: object[]; pageInfo: Paginated };
}

export interface SharedView {
  id?: string;
  fk_view_id?: string;
  password?: string;
  deleted?: string;
}

export interface SharedViewList {
  sharedViews: { list: SharedView[]; pageInfo: Paginated };
}

export interface ViewList {
  sharedViews: { list: Grid | Form | Kanban | Gallery; pageInfo: Paginated };
}

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface TableListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  projectId: string;
}

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from  "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "http://localhost:3000" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.instance.defaults.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      formData.append(
        key,
        property instanceof Blob
          ? property
          : typeof property === "object" && property !== null
          ? JSON.stringify(property)
          : `${property}`,
      );
      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = (format && this.format) || void 0;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      requestParams.headers.common = { Accept: "*/*" };
      requestParams.headers.post = {};
      requestParams.headers.put = {};

      body = this.createFormData(body as Record<string, unknown>);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title nocodb
 * @version 1.0
 * @baseUrl http://localhost:3000
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags AUTH
     * @name Signup
     * @summary Signup
     * @request POST:/auth/user/signup
     */
    signup: (data: { email?: boolean; password?: string }, params: RequestParams = {}) =>
      this.request<{ email: string; password: string }, any>({
        path: `/auth/user/signup`,
        method: "POST",
        body: data,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name Me
     * @summary User Info
     * @request GET:/auth/user/me
     */
    me: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/auth/user/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name Signin
     * @summary Signin
     * @request POST:/auth/user/signin
     */
    signin: (data: { email: string; password: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/user/signin`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name PasswordForgot
     * @summary Password Forgot
     * @request POST:/auth/password/forgot
     */
    passwordForgot: (data: { email?: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/password/forgot`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name PasswordChange
     * @summary Password Change
     * @request POST:/auth/password/change
     */
    passwordChange: (
      data: { old_password?: string; new_password?: string; new_password_repeat?: string },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/password/change`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name PasswordReset
     * @summary Password Reset
     * @request POST:/auth/password/reset
     */
    passwordReset: (data: { reset_token?: string; new_password?: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/password/reset`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name TokenVerify
     * @summary Password Verify
     * @request POST:/auth/token/verify
     */
    tokenVerify: (data: { token?: string; email?: string }, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/token/verify`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags AUTH
     * @name TokenRefresh
     * @summary Password Refresh
     * @request POST:/auth/token/refresh
     */
    tokenRefresh: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/token/refresh`,
        method: "POST",
        ...params,
      }),
  };
  meta = {
    /**
     * @description Read project details
     *
     * @tags Meta
     * @name ProjectList
     * @request GET:/projects/
     */
    projectList: (query: ProjectListParams, data: ProjectReq, params: RequestParams = {}) =>
      this.request<ProjectList, any>({
        path: `/projects/`,
        method: "GET",
        query: query,
        body: data,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ProjectCreate
     * @request POST:/projects/
     */
    projectCreate: (data: Project, params: RequestParams = {}) =>
      this.request<Project, any>({
        path: `/projects/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Read project details
     *
     * @tags Meta
     * @name ColumnList
     * @summary Column List
     * @request GET:/projects/{projectId}/{db}/tables/{tableId}/column
     */
    columnList: (tableId: string, projectId: string, db: string, params: RequestParams = {}) =>
      this.request<ColumnList, any>({
        path: `/projects/${projectId}/${db}/tables/${tableId}/column`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ColumnCreate
     * @summary Column create
     * @request POST:/projects/{projectId}/{db}/tables/{tableId}/column
     */
    columnCreate: (tableId: string, projectId: string, db: string, data: Column, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${db}/tables/${tableId}/column`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Read project details
     *
     * @tags Meta
     * @name ColumnRead
     * @summary Column Read
     * @request GET:/projects/{projectId}/{db}/tables/{tableId}/column/{columnId}
     */
    columnRead: (projectId: string, tableId: string, columnId: string, db: string, params: RequestParams = {}) =>
      this.request<Column, any>({
        path: `/projects/${projectId}/${db}/tables/${tableId}/column/${columnId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ColumnUpdate
     * @summary Column Update
     * @request PUT:/projects/{projectId}/{db}/tables/{tableId}/column/{columnId}
     */
    columnUpdate: (
      projectId: string,
      tableId: string,
      columnId: string,
      db: string,
      data: Column,
      params: RequestParams = {},
    ) =>
      this.request<Column, any>({
        path: `/projects/${projectId}/${db}/tables/${tableId}/column/${columnId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ColumnDelete
     * @request DELETE:/projects/{projectId}/{db}/tables/{tableId}/column/{columnId}
     */
    columnDelete: (projectId: string, tableId: string, columnId: string, db: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${db}/tables/${tableId}/column/${columnId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableCreate
     * @request POST:/projects/{projectId}/tables
     */
    tableCreate: (projectId: string, data: Table, params: RequestParams = {}) =>
      this.request<Table, any>({
        path: `/projects/${projectId}/tables`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableList
     * @request GET:/projects/{projectId}/tables
     */
    tableList: ({ projectId, ...query }: TableListParams, params: RequestParams = {}) =>
      this.request<TableList, any>({
        path: `/projects/${projectId}/tables`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableRead
     * @request GET:/projects/{projectId}/tables/{tableId}
     */
    tableRead: (projectId: string, tableId: string, params: RequestParams = {}) =>
      this.request<TableInfo, any>({
        path: `/projects/${projectId}/tables/${tableId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableUpdate
     * @request PUT:/projects/{projectId}/tables/{tableId}
     */
    tableUpdate: (projectId: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/tables/${tableId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableDelete
     * @request DELETE:/projects/{projectId}/tables/{tableId}
     */
    tableDelete: (projectId: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/tables/${tableId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterRead
     * @request GET:/projects/{projectId}/{dbAlias}/views/{viewId}/filters
     */
    filterRead: (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
      this.request<FilterList, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/filters`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterCreate
     * @request POST:/projects/{projectId}/{dbAlias}/views/{viewId}/filters
     */
    filterCreate: (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/filters`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortList
     * @request GET:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts
     */
    sortList: (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
      this.request<SortList, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortCreate
     * @request POST:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts
     */
    sortCreate: (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterGet
     * @request GET:/projects/{projectId}/{dbAlias}/views/{viewsId}/filters/{filterId}
     */
    filterGet: (projectId: string, dbAlias: string, filterId: string, viewsId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewsId}/filters/${filterId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterUpdate
     * @request PUT:/projects/{projectId}/{dbAlias}/views/{viewsId}/filters/{filterId}
     */
    filterUpdate: (projectId: string, dbAlias: string, filterId: string, viewsId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewsId}/filters/${filterId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterDelete
     * @request DELETE:/projects/{projectId}/{dbAlias}/views/{viewsId}/filters/{filterId}
     */
    filterDelete: (projectId: string, dbAlias: string, filterId: string, viewsId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewsId}/filters/${filterId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortGet
     * @request GET:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts/{sortId}
     */
    sortGet: (projectId: string, dbAlias: string, sortId: string, viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts/${sortId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortUpdate
     * @request PUT:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts/{sortId}
     */
    sortUpdate: (projectId: string, dbAlias: string, sortId: string, viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts/${sortId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortDelete
     * @request DELETE:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts/{sortId}
     */
    sortDelete: (projectId: string, dbAlias: string, sortId: string, viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts/${sortId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookGet
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks/{webhookId}
     */
    webhookGet: (projectId: string, dbAlias: string, tableId: string, webhookId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks/${webhookId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookUpdate
     * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks/{webhookId}
     */
    webhookUpdate: (
      projectId: string,
      dbAlias: string,
      tableId: string,
      webhookId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks/${webhookId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookDelete
     * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks/{webhookId}
     */
    webhookDelete: (
      projectId: string,
      dbAlias: string,
      tableId: string,
      webhookId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks/${webhookId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookList
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks
     */
    webhookList: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<HookList, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookCreate
     * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks
     */
    webhookCreate: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridCreate
     * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids
     */
    gridCreate: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridUpdate
     * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids/{gridId}
     */
    gridUpdate: (projectId: string, dbAlias: string, tableId: string, gridId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids/${gridId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridDelete
     * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids/{gridId}
     */
    gridDelete: (projectId: string, dbAlias: string, tableId: string, gridId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids/${gridId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridRead
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids/{gridId}
     */
    gridRead: (projectId: string, dbAlias: string, tableId: string, gridId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids/${gridId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FormCreate
     * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms
     */
    formCreate: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridUpdate2
     * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms/{formId}
     * @originalName gridUpdate
     * @duplicate
     */
    gridUpdate2: (projectId: string, dbAlias: string, tableId: string, formId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms/${formId} `,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridDelete2
     * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms/{formId}
     * @originalName gridDelete
     * @duplicate
     */
    gridDelete2: (projectId: string, dbAlias: string, tableId: string, formId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms/${formId} `,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridRead2
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms/{formId}
     * @originalName gridRead
     * @duplicate
     */
    gridRead2: (projectId: string, dbAlias: string, tableId: string, formId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms/${formId} `,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryCreate
     * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries
     */
    galleryCreate: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/galleries`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryUpdate
     * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries/{galleryId}
     */
    galleryUpdate: (
      projectId: string,
      dbAlias: string,
      tableId: string,
      galleryId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/galleries/${galleryId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryDelete
     * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries/{galleryId}
     */
    galleryDelete: (
      projectId: string,
      dbAlias: string,
      tableId: string,
      galleryId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/galleries/${galleryId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryRead
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries/{galleryId}
     */
    galleryRead: (projectId: string, dbAlias: string, tableId: string, galleryId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/galleries/${galleryId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanCreate
     * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans
     */
    kanbanCreate: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanUpdate
     * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans/{kanbanId}
     */
    kanbanUpdate: (projectId: string, dbAlias: string, tableId: string, kanbanId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans/${kanbanId}`,
        method: "PUT",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanDelete
     * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans/{kanbanId}
     */
    kanbanDelete: (projectId: string, dbAlias: string, tableId: string, kanbanId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans/${kanbanId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanRead
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans/{kanbanId}
     */
    kanbanRead: (projectId: string, dbAlias: string, tableId: string, kanbanId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans/${kanbanId}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewsList
     * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/views
     */
    viewsList: (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
      this.request<ViewList, any>({
        path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/views`,
        method: "GET",
        ...params,
      }),
  };
}
