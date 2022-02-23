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

export interface UserType {
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

export interface UserListType {
  users: { list: UserType; pageInfo: PaginatedType };
}

export interface ProjectReqType {
  title?: string;
  description?: string;
  color?: string;
  bases?: BaseReqType[];
}

export interface ProjectType {
  id?: string;
  title?: string;
  status?: string;
  description?: string;
  meta?: string | object;
  color?: string;
  deleted?: string | boolean;
  order?: number;
  bases?: BaseType[];
}

export interface ProjectListType {
  projects: { list: ProjectType[]; pageInfo: PaginatedType };
}

export interface BaseType {
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

export interface BaseReqType {
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

export interface BaseListType {
  bases: { list: BaseType[]; pageInfo: PaginatedType };
}

export interface TableType {
  id?: string;
  fk_project_id?: string;
  fk_base_id?: string;
  tn: string;
  _tn: string;
  type?: string;
  enabled?: boolean;
  parent_id?: string;
  show_as?: string;
  tags?: string;
  pinned?: boolean;
  deleted?: boolean;
  order?: number;
  columns?: ColumnType[];
  columnsById?: object;
}

export interface ViewType {
  id?: string;
  title?: string;
  deleted?: boolean;
  order?: number;
  fk_model_id?: string;
}

export interface TableInfoType {
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
  column?: ColumnType[];
  filters?: FilterType[];
  sort?: SortType[];
}

export interface TableReqType {
  id?: string;
  fk_project_id?: string;
  fk_base_id?: string;
  tn: string;
  _tn: string;
  type?: string;
  enabled?: string;
  parent_id?: string;
  show_as?: string;
  tags?: string;
  pinned?: boolean;
  deleted?: boolean;
  order?: number;
  columns?: string | any[];
}

export interface TableListType {
  tables: { list: TableType[]; pageInfo: PaginatedType };
}

export interface FilterType {
  id?: string;
  fk_model_id?: string;
  fk_column_id?: string;
  logical_op?: string;
  comparison_op?: string;
  value?: string | number | number | boolean | null;
  is_group?: boolean;
  children?: FilterType[];
}

export interface FilterListType {
  filters: { list: FilterType[] };
}

export interface SortType {
  id?: string;
  fk_model_id?: string;
  fk_column_id?: string;
  direction?: string;
  order?: number;
}

export interface SortListType {
  sorts: { list: SharedViewType[] };
}

export interface ColumnType {
  id?: string;
  base_id?: string;
  fk_model_id?: string;
  title?: string;
  alias?: string;
  uidt?: string;
  dt?: string;
  np?: string;
  ns?: string;
  clen?: string | number;
  cop?: string;
  pk?: boolean;
  pv?: boolean;
  rqd?: boolean;
  un?: boolean;
  ct?: string;
  ai?: boolean;
  unique?: boolean;
  cdf?: string;
  cc?: string;
  csn?: string;
  dtx?: string;
  dtxp?: string;
  dtxs?: string;
  au?: boolean;
  deleted?: boolean;
  visible?: boolean;
  order?: number;
  colOptions?:
    | LinkToAnotherRecordType
    | FormulaType
    | RollupType
    | LookupType
    | SelectOptionsType[];
  cn?: string;
  _cn?: string;
}

export interface ColumnListType {
  columns: { list: ColumnType[] };
}

export interface LinkToAnotherRecordType {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  fk_child_column_id?: string;
  fk_parent_column_id?: string;
  fk_mm_model_id?: string;
  fk_related_model_id?: string;
  fk_mm_child_column_id?: string;
  fk_mm_parent_column_id?: string;
  ur?: string;
  dr?: string;
  fk_index_name?: string;
  deleted?: string;
  order?: string;
}

export interface LookupType {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  fk_relation_column_id?: string;
  fk_lookup_column_id?: string;
  deleted?: string;
  order?: string;
}

export interface RollupType {
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

export interface FormulaType {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  formula?: string;
  deleted?: string;
  order?: string;
}

export interface SelectOptionsType {
  id?: string;
  type?: string;
  virtual?: boolean;
  fk_column_id?: string;
  title?: string;
  color?: string;
  order?: number;
}

export interface GridType {
  id?: string;
  title?: string;
  alias?: string;
  deleted?: boolean;
  order?: number;
}

export interface GalleryType {
  fk_view_id?: string;
  title?: string;
  alias?: string;
  deleted?: boolean;
  order?: number;
  next_enabled?: boolean;
  prev_enabled?: boolean;
  cover_image_idx?: number;
  cover_image?: string;
  restrict_types?: string;
  restrict_size?: string;
  restrict_number?: string;
  columns?: GalleryColumnType[];
  fk_model_id?: string;
  fk_cover_image_col_id?: string;
}

export interface GalleryColumnType {
  id?: string;
  label?: string;
  help?: string;
  fk_col_id?: string;
  fk_gallery_id?: string;
}

export interface GridColumnType {
  id?: string;
  label?: string;
  help?: string;
  fk_col_id?: string;
  fk_gallery_id?: string;
}

export interface KanbanColumnType {
  id?: string;
  label?: string;
  help?: string;
  fk_column_id?: string;
  fk_kanban_id?: string;
}

export interface KanbanType {
  id?: string;
  title?: string;
  alias?: string;
  public?: boolean;
  password?: string;
  columns?: KanbanColumnType[];
  fk_model_id?: string;
}

export interface FormType {
  id?: string;
  title?: string;
  heading?: string;
  subheading?: string;
  sucess_msg?: string;
  redirect_url?: string;
  redirect_after_secs?: string;
  email?: string;
  banner_image_url?: string;
  logo_url?: string;
  submit_another_form?: boolean;
  columns?: FormColumnType[];
  fk_model_id?: string;
}

export interface FormColumnType {
  fk_column_id?: string;
  id?: string;
  fk_view_id?: string;
  uuid?: any;
  label?: string;
  help?: any;
  required?: boolean;
  show?: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export interface PaginatedType {
  pageSize?: number;
  totalRows?: number;
  sort?: string | any[];
  isFirstPage?: boolean;
  isLastPage?: boolean;
  page?: number;
}

export interface HookListType {
  hooks: { list: object[]; pageInfo: PaginatedType };
}

export interface SharedViewType {
  id?: string;
  fk_view_id?: string;
  password?: string;
  deleted?: string;
}

export interface SharedViewListType {
  sharedViews: { list: SharedViewType[]; pageInfo: PaginatedType };
}

export interface ViewListType {
  views: {
    list: GridType | FormType | KanbanType | GalleryType;
    pageInfo: PaginatedType;
  };
}

export interface AttachmentType {
  url?: string;
  title?: string;
  mimetype?: string;
  size?: string;
  icon?: string;
}

export interface WebhookType {
  id?: string;
  title?: string;
  type?: string;
}

export interface AuditType {
  id?: string;
  user?: string;
  ip?: string;
  base_id?: string;
  project_id?: string;
  fk_model_id?: string;
  row_id?: string;
  op_type?: string;
  op_sub_type?: string;
  status?: string;
  description?: string;
  details?: string;
}

export interface HookType {
  id?: string;
  fk_model_id?: string;
  title?: string;
  description?: string;
  env?: string;
  type?: string;
  event?: 'After' | 'Before';
  operation?: 'insert' | 'delete' | 'update';
  async?: boolean;
  payload?: boolean;
  url?: string;
  headers?: string;
  condition?: string;
  notification?: string;
  retries?: number;
  retry_interval?: number;
  timeout?: number;
  active?: boolean;
}

export interface UploadPayloadType {
  files?: any;
  json?: string;
}

export interface SigninPayloadType {
  email: string;
  password: string;
}

export interface PasswordForgotPayloadType {
  email?: string;
}

export interface PasswordChangePayloadType {
  old_password?: string;
  new_password?: string;
  new_password_repeat?: string;
}

export interface PasswordResetPayloadType {
  reset_token?: string;
  new_password?: string;
}

export interface TokenVerifyPayloadType {
  token?: string;
  email?: string;
}

export interface ProjectListParamsType {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface TableListParamsType {
  page?: number;
  pageSize?: number;
  sort?: string;
  projectId: string;
  baseId: string;
}

export interface ViewUpdatePayloadType {
  order?: string;
  title?: string;
}

export type ViewColumnCreatePayloadType = any;

export type ViewColumnUpdatePayloadType = any;

export interface SetSharedViewPasswordPayloadType {
  password?: string;
}

export type CreatePayloadType = any;

export interface DataListPayloadType {
  password?: string;
  sorts?: string;
  filters?: string;
}

export interface DataListParamsType {
  limit?: string;
  offset?: string;
  uuid: string;
}

export interface DataCreatePayloadType {
  data?: any;
  password?: string;
}

export interface DataRelationListPayloadType {
  password?: string;
}

export interface DataRelationListParamsType {
  limit?: string;
  offset?: string;
  uuid: string;
  relationColumnId: string;
}

export interface SharedViewMetaGetPayloadType {
  password?: string;
}

export type UpdatePayloadType = any;

export interface CommentListParamsType {
  row_id: string;
  fk_model_id: string;
  comments_only?: boolean;
}

export interface CommentRowPayloadType {
  row_id: string;
  fk_model_id: string;
  comment: string;
}

export interface CommentCountParamsType {
  ids: any[];
  fk_model_id: string;
}

export interface ProjectAuditListParamsType {
  offset?: string;
  limit?: string;
  projectId: string;
}

export interface AuditRowUpdatePayloadType {
  fk_model_id?: string;
  column_name?: string;
  row_id?: string;
  value?: string;
  prev_value?: string;
}

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType,
} from 'axios';

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, 'data' | 'params' | 'url' | 'responseType'> {
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

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, 'data' | 'cancelToken'> {
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || 'http://localhost:8080',
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig
  ): AxiosRequestConfig {
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
          : typeof property === 'object' && property !== null
          ? JSON.stringify(property)
          : `${property}`
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
      ((typeof secure === 'boolean' ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = (format && this.format) || void 0;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === 'object'
    ) {
      requestParams.headers.common = { Accept: '*/*' };
      requestParams.headers.post = {};
      requestParams.headers.put = {};

      body = this.createFormData(body as Record<string, unknown>);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData
          ? { 'Content-Type': type }
          : {}),
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
 * @baseUrl http://localhost:8080
 */
export class Api<
  SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags AUTH
     * @name Signup
     * @summary Signup
     * @request POST:/auth/user/signup
     */
    signup: (
      data: { email?: boolean; password?: string },
      params: RequestParams = {}
    ) =>
      this.request<{ email: string; password: string }, any>({
        path: `/auth/user/signup`,
        method: 'POST',
        body: data,
        format: 'json',
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
      this.request<UserType, any>({
        path: `/auth/user/me`,
        method: 'GET',
        format: 'json',
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
    signin: (data: SigninPayloadType, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/user/signin`,
        method: 'POST',
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
    passwordForgot: (
      data: PasswordForgotPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/auth/password/forgot`,
        method: 'POST',
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
      data: PasswordChangePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/auth/password/change`,
        method: 'POST',
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
    passwordReset: (
      data: PasswordResetPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/auth/password/reset`,
        method: 'POST',
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
    tokenVerify: (data: TokenVerifyPayloadType, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/token/verify`,
        method: 'POST',
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
        method: 'POST',
        ...params,
      }),
  };
  meta = {
    /**
     * No description
     *
     * @tags Meta
     * @name Upload
     * @summary Attachment
     * @request POST:/projects/{projectId}/views/{viewId}/upload
     */
    upload: (
      projectId: string,
      viewId: string,
      data: UploadPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/projects/${projectId}/views/${viewId}/upload`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Read project details
     *
     * @tags Meta
     * @name ProjectList
     * @request GET:/projects/
     */
    projectList: (
      query: ProjectListParamsType,
      data: ProjectReqType,
      params: RequestParams = {}
    ) =>
      this.request<ProjectListType, any>({
        path: `/projects/`,
        method: 'GET',
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
    projectCreate: (data: ProjectType, params: RequestParams = {}) =>
      this.request<ProjectType, any>({
        path: `/projects/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Read project details
     *
     * @tags Meta
     * @name ProjectRead
     * @request GET:/projects/{projectId}
     */
    projectRead: (projectId: string, params: RequestParams = {}) =>
      this.request<object, ProjectType>({
        path: `/projects/${projectId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableCreate
     * @request POST:/projects/{projectId}/{baseId}/tables
     */
    tableCreate: (
      projectId: string,
      baseId: string,
      data: TableReqType,
      params: RequestParams = {}
    ) =>
      this.request<TableType, any>({
        path: `/projects/${projectId}/${baseId}/tables`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableList
     * @request GET:/projects/{projectId}/{baseId}/tables
     */
    tableList: (
      { projectId, baseId, ...query }: TableListParamsType,
      params: RequestParams = {}
    ) =>
      this.request<TableListType, any>({
        path: `/projects/${projectId}/${baseId}/tables`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableRead
     * @request GET:/tables/{tableId}
     */
    tableRead: (tableId: string, params: RequestParams = {}) =>
      this.request<TableInfoType, any>({
        path: `/tables/${tableId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableUpdate
     * @request PUT:/tables/{tableId}
     */
    tableUpdate: (tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}`,
        method: 'PUT',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name TableDelete
     * @request DELETE:/tables/{tableId}
     */
    tableDelete: (tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * @description Read project details
     *
     * @tags Meta
     * @name ColumnList
     * @summary Column List
     * @request GET:/tables/{tableId}/columns
     */
    columnList: (tableId: string, params: RequestParams = {}) =>
      this.request<ColumnListType, any>({
        path: `/tables/${tableId}/columns`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ColumnCreate
     * @summary Column create
     * @request POST:/tables/{tableId}/columns
     */
    columnCreate: (
      tableId: string,
      data: ColumnType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/columns`,
        method: 'POST',
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
     * @request GET:/tables/{tableId}/columns/{columnId}
     */
    columnRead: (
      tableId: string,
      columnId: string,
      params: RequestParams = {}
    ) =>
      this.request<ColumnType, any>({
        path: `/tables/${tableId}/columns/${columnId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ColumnUpdate
     * @summary Column Update
     * @request PUT:/tables/{tableId}/columns/{columnId}
     */
    columnUpdate: (
      tableId: string,
      columnId: string,
      data: ColumnType,
      params: RequestParams = {}
    ) =>
      this.request<ColumnType, any>({
        path: `/tables/${tableId}/columns/${columnId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ColumnDelete
     * @request DELETE:/tables/{tableId}/columns/{columnId}
     */
    columnDelete: (
      tableId: string,
      columnId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/columns/${columnId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewUpdate
     * @request PUT:/views/{viewId}
     */
    viewUpdate: (
      viewId: string,
      data: ViewUpdatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags meta
     * @name ViewDelete
     * @request DELETE:/views/{viewId}
     */
    viewDelete: (viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/views/${viewId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterRead
     * @request GET:/views/{viewId}/filters - copy
     */
    filterRead: (viewId: string, params: RequestParams = {}) =>
      this.request<FilterListType, any>({
        path: `/views/${viewId}/filters - copy`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterCreate
     * @request POST:/views/{viewId}/filters - copy
     */
    filterCreate: (
      viewId: string,
      data: FilterType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}/filters - copy`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewColumnList
     * @request GET:/views/{viewId}/columns
     */
    viewColumnList: (viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/views/${viewId}/columns`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewColumnCreate
     * @request POST:/views/{viewId}/columns
     */
    viewColumnCreate: (
      viewId: string,
      data: ViewColumnCreatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}/columns`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewColumnRead
     * @request GET:/views/{viewId}/columns/{columnId}
     */
    viewColumnRead: (
      viewId: string,
      columnId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/views/${viewId}/columns/${columnId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewColumnUpdate
     * @request PUT:/views/{viewId}/columns/{columnId}
     */
    viewColumnUpdate: (
      viewId: string,
      columnId: string,
      data: ViewColumnUpdatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}/columns/${columnId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortList
     * @request GET:/views/{viewId}/sorts
     */
    sortList: (viewId: string, params: RequestParams = {}) =>
      this.request<SortListType, { uuid?: string; url?: string }>({
        path: `/views/${viewId}/sorts`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortCreate
     * @request POST:/views/{viewId}/sorts
     */
    sortCreate: (viewId: string, data: SortType, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/views/${viewId}/sorts`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ShareView
     * @request POST:/views/{viewId}/share
     */
    shareView: (viewId: string, params: RequestParams = {}) =>
      this.request<{ uuid?: string }, any>({
        path: `/views/${viewId}/share`,
        method: 'POST',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags meta
     * @name SetSharedViewPassword
     * @request PUT:/views/{viewId}/share
     */
    setSharedViewPassword: (
      viewId: string,
      data: SetSharedViewPasswordPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<SharedViewType, any>({
        path: `/views/${viewId}/share`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags meta
     * @name DeleteSharedView
     * @request DELETE:/views/{viewId}/share
     */
    deleteSharedView: (viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/views/${viewId}/share`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortGet
     * @request GET:/views/{viewId}/sorts/{sortId}
     */
    sortGet: (viewId: string, sortId: string, params: RequestParams = {}) =>
      this.request<SortType, any>({
        path: `/views/${viewId}/sorts/${sortId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortUpdate
     * @request PUT:/views/{viewId}/sorts/{sortId}
     */
    sortUpdate: (
      viewId: string,
      sortId: string,
      data: SortType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}/sorts/${sortId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name SortDelete
     * @request DELETE:/views/{viewId}/sorts/{sortId}
     */
    sortDelete: (viewId: string, sortId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/views/${viewId}/sorts/${sortId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterGet
     * @request GET:/views/{viewId}/filters/{filterId}
     */
    filterGet: (viewId: string, filterId: string, params: RequestParams = {}) =>
      this.request<FilterType, any>({
        path: `/views/${viewId}/filters/${filterId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterUpdate
     * @request PUT:/views/{viewId}/filters/{filterId}
     */
    filterUpdate: (
      viewId: string,
      filterId: string,
      data: FilterType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}/filters/${filterId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterDelete
     * @request DELETE:/views/{viewId}/filters/{filterId}
     */
    filterDelete: (
      viewId: string,
      filterId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewId}/filters/${filterId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FilterChildrenRead
     * @request GET:/views/{viewId}/filters/{filterParentId}/children
     */
    filterChildrenRead: (
      viewId: string,
      filterParentId: string,
      params: RequestParams = {}
    ) =>
      this.request<FilterType, any>({
        path: `/views/${viewId}/filters/${filterParentId}/children`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookGet
     * @request GET:/tables/{tableId}/webhooks/{webhookId}
     */
    webhookGet: (
      tableId: string,
      webhookId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/webhooks/${webhookId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookUpdate
     * @request PUT:/tables/{tableId}/webhooks/{webhookId}
     */
    webhookUpdate: (
      tableId: string,
      webhookId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/webhooks/${webhookId}`,
        method: 'PUT',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookDelete
     * @request DELETE:/tables/{tableId}/webhooks/{webhookId}
     */
    webhookDelete: (
      tableId: string,
      webhookId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/webhooks/${webhookId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookList
     * @request GET:/tables/{tableId}/webhooks
     */
    webhookList: (tableId: string, params: RequestParams = {}) =>
      this.request<WebhookType[], any>({
        path: `/tables/${tableId}/webhooks`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name WebhookCreate
     * @request POST:/tables/{tableId}/webhooks
     */
    webhookCreate: (
      tableId: string,
      data: WebhookType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/webhooks`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridCreate
     * @request POST:/tables/{tableId}/grids
     */
    gridCreate: (tableId: string, data: GridType, params: RequestParams = {}) =>
      this.request<GridType, any>({
        path: `/tables/${tableId}/grids`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridUpdate
     * @request PUT:/tables/{tableId}/grids/{gridId}
     */
    gridUpdate: (tableId: string, gridId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/grids/${gridId}`,
        method: 'PUT',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridDelete
     * @request DELETE:/tables/{tableId}/grids/{gridId}
     */
    gridDelete: (tableId: string, gridId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/grids/${gridId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GridRead
     * @request GET:/tables/{tableId}/grids/{gridId}
     */
    gridRead: (tableId: string, gridId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/grids/${gridId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FormCreate
     * @request POST:/tables/{tableId}/forms
     */
    formCreate: (tableId: string, data: FormType, params: RequestParams = {}) =>
      this.request<FormType, any>({
        path: `/tables/${tableId}/forms`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FormUpdate
     * @request PUT:/forms/{formId}
     */
    formUpdate: (formId: string, data: FormType, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/forms/${formId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FormRead
     * @request GET:/forms/{formId}
     */
    formRead: (formId: string, params: RequestParams = {}) =>
      this.request<FormType, any>({
        path: `/forms/${formId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name FormColumnUpdate
     * @request PUT:/formColumns/{columnId}
     */
    formColumnUpdate: (
      columnId: string,
      data: FormColumnType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/formColumns/${columnId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryCreate
     * @request POST:/tables/{tableId}/galleries
     */
    galleryCreate: (
      tableId: string,
      data: GalleryType,
      params: RequestParams = {}
    ) =>
      this.request<object, any>({
        path: `/tables/${tableId}/galleries`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryUpdate
     * @request PUT:/galleries/{galleryId}
     */
    galleryUpdate: (
      galleryId: string,
      data: GalleryType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/galleries/${galleryId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryDelete
     * @request DELETE:/galleries/{galleryId}
     */
    galleryDelete: (galleryId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/galleries/${galleryId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name GalleryRead
     * @request GET:/galleries/{galleryId}
     */
    galleryRead: (galleryId: string, params: RequestParams = {}) =>
      this.request<GalleryType, any>({
        path: `/galleries/${galleryId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanCreate
     * @request POST:/tables/{tableId}/kanbans
     */
    kanbanCreate: (tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/kanbans`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanUpdate
     * @request PUT:/tables/{tableId}/kanbans/{kanbanId}
     */
    kanbanUpdate: (
      tableId: string,
      kanbanId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/kanbans/${kanbanId}`,
        method: 'PUT',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanDelete
     * @request DELETE:/tables/{tableId}/kanbans/{kanbanId}
     */
    kanbanDelete: (
      tableId: string,
      kanbanId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/kanbans/${kanbanId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name KanbanRead
     * @request GET:/tables/{tableId}/kanbans/{kanbanId}
     */
    kanbanRead: (
      tableId: string,
      kanbanId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/kanbans/${kanbanId}`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ViewsList
     * @request GET:/tables/{tableId}/views
     */
    viewsList: (tableId: string, params: RequestParams = {}) =>
      this.request<ViewListType, any>({
        path: `/tables/${tableId}/views`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name CommentList
     * @request GET:/audits/comments
     */
    commentList: (query: CommentListParamsType, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/audits/comments`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name CommentRow
     * @request POST:/audits/comments
     */
    commentRow: (data: CommentRowPayloadType, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/audits/comments`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name CommentCount
     * @request GET:/audits/comments/count
     */
    commentCount: (query: CommentCountParamsType, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/audits/comments/count`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name ProjectAuditList
     * @request GET:project/{projectId}/audits
     */
    projectAuditList: (
      { projectId, ...query }: ProjectAuditListParamsType,
      params: RequestParams = {}
    ) =>
      this.request<
        { audits?: { list: AuditType[]; pageInfo: PaginatedType } },
        any
      >({
        path: `project/${projectId}/audits`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name AuditRowUpdate
     * @request POST:/audits/rowUpdate
     */
    auditRowUpdate: (
      data: AuditRowUpdatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/audits/rowUpdate`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name HookList
     * @request GET:/tables/{tableId}/hooks
     */
    hookList: (tableId: string, params: RequestParams = {}) =>
      this.request<
        { hooks?: { list: HookType[]; pageInfo: PaginatedType } },
        any
      >({
        path: `/tables/${tableId}/hooks`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Meta
     * @name HookCreate
     * @request POST:/tables/{tableId}/hooks
     */
    hookCreate: (
      tableId: string,
      data: AuditType,
      params: RequestParams = {}
    ) =>
      this.request<AuditType, any>({
        path: `/tables/${tableId}/hooks`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags meta
     * @name HookTest
     * @request POST:/tables/{tableId}/hooks/test
     */
    hookTest: (tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/hooks/test`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @tags meta
     * @name HookUpdate
     * @request PUT:/hooks/{hookId}
     */
    hookUpdate: (hookId: string, data: HookType, params: RequestParams = {}) =>
      this.request<HookType, any>({
        path: `/hooks/${hookId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags meta
     * @name HookDelete
     * @request DELETE:/hooks/{hookId}
     */
    hookDelete: (hookId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/hooks/${hookId}`,
        method: 'DELETE',
        ...params,
      }),
  };
  projects = {
    /**
     * No description
     *
     * @name PutProjectsCopy
     * @request PUT:/projects/{projectId}
     */
    putProjectsCopy: (projectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}`,
        method: 'PUT',
        ...params,
      }),

    /**
     * No description
     *
     * @name DeleteProjectsCopy
     * @request DELETE:/projects/{projectId}
     */
    deleteProjectsCopy: (projectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @name ProjectReorder
     * @request POST:/projects/{projectId}/reorder
     */
    projectReorder: (projectId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${projectId}/reorder`,
        method: 'POST',
        ...params,
      }),
  };
  tables = {
    /**
     * No description
     *
     * @name TableReorder
     * @request POST:/tables/{tableId}/reorder
     */
    tableReorder: (tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/reorder`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @name ColumnReorder
     * @request POST:/tables/{tableId}/columns/reorder
     */
    columnReorder: (tableId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/tables/${tableId}/columns/reorder`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @name WebhookReorder
     * @request POST:/tables/{tableId}/webhooks/{webhookId}/reorder
     */
    webhookReorder: (
      tableId: string,
      webhookId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/tables/${tableId}/webhooks/${webhookId}/reorder`,
        method: 'POST',
        ...params,
      }),
  };
  views = {
    /**
     * No description
     *
     * @name FilterReorder
     * @request POST:/views/{viewsId}/filters/{filterId}/reorder
     */
    filterReorder: (
      filterId: string,
      viewsId: string,
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/views/${viewsId}/filters/${filterId}/reorder`,
        method: 'POST',
        ...params,
      }),

    /**
     * No description
     *
     * @name SortReorder
     * @request POST:/views/{viewId}/sorts/{sortId}/reorder
     */
    sortReorder: (sortId: string, viewId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/views/${viewId}/sorts/${sortId}/reorder`,
        method: 'POST',
        ...params,
      }),
  };
  data = {
    /**
     * No description
     *
     * @tags Data
     * @name List
     * @request GET:/data/{tableId}
     */
    list: (tableId: string, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/data/${tableId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Data
     * @name Create
     * @request POST:/data/{tableId}
     */
    create: (
      tableId: string,
      data: CreatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/data/${tableId}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Data
     * @name CsvExport
     * @request GET:/data/{tableId}/export/{type}
     */
    csvExport: (
      tableId: string,
      type: 'csv' | 'excel',
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/data/${tableId}/export/${type}`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Data
     * @name Read
     * @request GET:/data/{tableId}/{rowId}
     */
    read: (tableId: string, rowId: string, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/data/${tableId}/${rowId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Data
     * @name Update
     * @request PUT:/data/{tableId}/{rowId}
     */
    update: (
      tableId: string,
      rowId: string,
      data: UpdatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/data/${tableId}/${rowId}`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Data
     * @name Delete
     * @request DELETE:/data/{tableId}/{rowId}
     */
    delete: (tableId: string, rowId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/data/${tableId}/${rowId}`,
        method: 'DELETE',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Data
     * @name MmList
     * @request GET:/data/{tableId}/{rowId}/mm/{colId}
     */
    mmList: (
      tableId: string,
      rowId: string,
      colId: string,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `/data/${tableId}/${rowId}/mm/${colId}`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
  public = {
    /**
     * No description
     *
     * @tags Public
     * @name DataList
     * @request POST:public/data/{uuid}/list
     */
    dataList: (
      { uuid, ...query }: DataListParamsType,
      data: DataListPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `public/data/${uuid}/list`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public
     * @name DataCreate
     * @request POST:public/data/{uuid}/create
     */
    dataCreate: (
      uuid: string,
      data: DataCreatePayloadType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `public/data/${uuid}/create`,
        method: 'POST',
        body: data,
        type: ContentType.FormData,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Public
     * @name DataRelationList
     * @request POST:public/data/{uuid}/relationTable/{relationColumnId}
     */
    dataRelationList: (
      { uuid, relationColumnId, ...query }: DataRelationListParamsType,
      data: DataRelationListPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<any, any>({
        path: `public/data/${uuid}/relationTable/${relationColumnId}`,
        method: 'POST',
        query: query,
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags
     * @name SharedViewMetaGet
     * @request POST:public/meta/{uuid}
     */
    sharedViewMetaGet: (
      uuid: string,
      data: SharedViewMetaGetPayloadType,
      params: RequestParams = {}
    ) =>
      this.request<object, any>({
        path: `public/meta/${uuid}`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
