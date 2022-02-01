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

import {
  Column,
  ColumnList,
  FilterList,
  HookList,
  Project,
  ProjectList,
  ProjectReq,
  SortList,
  Table,
  TableList,
  ViewList,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Projects<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Read project details
   *
   * @tags Project
   * @name ProjectList
   * @request GET:/projects/
   */
  projectList = (data: ProjectReq, params: RequestParams = {}) =>
    this.request<ProjectList, any>({
      path: `/projects/`,
      method: "GET",
      body: data,
      ...params,
    });
  /**
   * No description
   *
   * @name ProjectCreate
   * @request POST:/projects/
   */
  projectCreate = (data: Project, params: RequestParams = {}) =>
    this.request<Project, any>({
      path: `/projects/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Read project details
   *
   * @tags Column
   * @name ColumnList
   * @summary Column List
   * @request GET:/projects/{projectId}/{db}/tables/{tableId}/column
   */
  columnList = (tableId: string, projectId: string, db: string, params: RequestParams = {}) =>
    this.request<ColumnList, any>({
      path: `/projects/${projectId}/${db}/tables/${tableId}/column`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Column
   * @name ColumnCreate
   * @summary Column create
   * @request POST:/projects/{projectId}/{db}/tables/{tableId}/column
   */
  columnCreate = (tableId: string, projectId: string, db: string, data: Column, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${db}/tables/${tableId}/column`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description Read project details
   *
   * @tags Column
   * @name ColumnRead
   * @summary Column Read
   * @request GET:/projects/{projectId}/{db}/tables/{tableId}/column/{columnId}
   */
  columnRead = (projectId: string, tableId: string, columnId: string, db: string, params: RequestParams = {}) =>
    this.request<Column, any>({
      path: `/projects/${projectId}/${db}/tables/${tableId}/column/${columnId}`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Column
   * @name ColumnUpdate
   * @summary Column Update
   * @request PUT:/projects/{projectId}/{db}/tables/{tableId}/column/{columnId}
   */
  columnUpdate = (
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
    });
  /**
   * No description
   *
   * @name ColumnDelete
   * @request DELETE:/projects/{projectId}/{db}/tables/{tableId}/column/{columnId}
   */
  columnDelete = (projectId: string, tableId: string, columnId: string, db: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${db}/tables/${tableId}/column/${columnId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name TableCreate
   * @request POST:/projects/{projectId}/tables
   */
  tableCreate = (projectId: string, data: Table, params: RequestParams = {}) =>
    this.request<Table, any>({
      path: `/projects/${projectId}/tables`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name TableList
   * @request GET:/projects/{projectId}/tables
   */
  tableList = (projectId: string, params: RequestParams = {}) =>
    this.request<TableList, any>({
      path: `/projects/${projectId}/tables`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name TableRead
   * @request GET:/projects/{projectId}/tables/{tableId}
   */
  tableRead = (projectId: string, tableId: string, data: any, params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/projects/${projectId}/tables/${tableId}`,
      method: "GET",
      body: data,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name TableUpdate
   * @request PUT:/projects/{projectId}/tables/{tableId}
   */
  tableUpdate = (projectId: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/tables/${tableId}`,
      method: "PUT",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name TableDelete
   * @request DELETE:/projects/{projectId}/tables/{tableId}
   */
  tableDelete = (projectId: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/tables/${tableId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags Filter
   * @name FilterRead
   * @request GET:/projects/{projectId}/{dbAlias}/views/{viewId}/filters
   */
  filterRead = (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
    this.request<FilterList, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/filters`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Filter
   * @name FilterCreate
   * @request POST:/projects/{projectId}/{dbAlias}/views/{viewId}/filters
   */
  filterCreate = (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/filters`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags Sort
   * @name SortList
   * @request GET:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts
   */
  sortList = (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
    this.request<SortList, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Filter
   * @name SortCreate
   * @request POST:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts
   */
  sortCreate = (projectId: string, dbAlias: string, viewId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags Filter
   * @name FilterGet
   * @request GET:/projects/{projectId}/{dbAlias}/views/{viewsId}/filters/{filterId}
   */
  filterGet = (projectId: string, dbAlias: string, filterId: string, viewsId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewsId}/filters/${filterId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name FilterUpdate
   * @request PUT:/projects/{projectId}/{dbAlias}/views/{viewsId}/filters/{filterId}
   */
  filterUpdate = (projectId: string, dbAlias: string, filterId: string, viewsId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewsId}/filters/${filterId}`,
      method: "PUT",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name FilterDelete
   * @request DELETE:/projects/{projectId}/{dbAlias}/views/{viewsId}/filters/{filterId}
   */
  filterDelete = (projectId: string, dbAlias: string, filterId: string, viewsId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewsId}/filters/${filterId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags Filter
   * @name SortGet
   * @request GET:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts/{sortId}
   */
  sortGet = (projectId: string, dbAlias: string, sortId: string, viewId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts/${sortId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name SortUpdate
   * @request PUT:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts/{sortId}
   */
  sortUpdate = (projectId: string, dbAlias: string, sortId: string, viewId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts/${sortId}`,
      method: "PUT",
      ...params,
    });
  /**
   * No description
   *
   * @tags Table
   * @name SortDelete
   * @request DELETE:/projects/{projectId}/{dbAlias}/views/{viewId}/sorts/{sortId}
   */
  sortDelete = (projectId: string, dbAlias: string, sortId: string, viewId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/views/${viewId}/sorts/${sortId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags Webhook
   * @name WebhookGet
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks/{webhookId}
   */
  webhookGet = (projectId: string, dbAlias: string, tableId: string, webhookId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks/${webhookId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Webhook
   * @name WebhookUpdate
   * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks/{webhookId}
   */
  webhookUpdate = (
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
    });
  /**
   * No description
   *
   * @tags Webhook
   * @name WebhookDelete
   * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks/{webhookId}
   */
  webhookDelete = (
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
    });
  /**
   * No description
   *
   * @tags Webhook
   * @name WebhookList
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks
   */
  webhookList = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<HookList, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags Webhook
   * @name WebhookCreate
   * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/webhooks
   */
  webhookCreate = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/webhooks`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name GridCreate
   * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids
   */
  gridCreate = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name GridUpdate
   * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids/{gridId}
   */
  gridUpdate = (projectId: string, dbAlias: string, tableId: string, gridId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids/${gridId}`,
      method: "PUT",
      ...params,
    });
  /**
   * No description
   *
   * @name GridDelete
   * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids/{gridId}
   */
  gridDelete = (projectId: string, dbAlias: string, tableId: string, gridId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids/${gridId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name GridRead
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/grids/{gridId}
   */
  gridRead = (projectId: string, dbAlias: string, tableId: string, gridId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/grids/${gridId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name FormCreate
   * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms
   */
  formCreate = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name GridUpdate2
   * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms/{formId}
   * @originalName gridUpdate
   * @duplicate
   */
  gridUpdate2 = (projectId: string, dbAlias: string, tableId: string, formId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms/${formId} `,
      method: "PUT",
      ...params,
    });
  /**
   * No description
   *
   * @name GridDelete2
   * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms/{formId}
   * @originalName gridDelete
   * @duplicate
   */
  gridDelete2 = (projectId: string, dbAlias: string, tableId: string, formId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms/${formId} `,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name GridRead2
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/forms/{formId}
   * @originalName gridRead
   * @duplicate
   */
  gridRead2 = (projectId: string, dbAlias: string, tableId: string, formId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/forms/${formId} `,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name GalleryCreate
   * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries
   */
  galleryCreate = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/galleries`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name GalleryUpdate
   * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries/{galleryId}
   */
  galleryUpdate = (
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
    });
  /**
   * No description
   *
   * @name GalleryDelete
   * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries/{galleryId}
   */
  galleryDelete = (
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
    });
  /**
   * No description
   *
   * @tags View
   * @name GalleryRead
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/galleries/{galleryId}
   */
  galleryRead = (projectId: string, dbAlias: string, tableId: string, galleryId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/galleries/${galleryId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name KanbanCreate
   * @request POST:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans
   */
  kanbanCreate = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans`,
      method: "POST",
      ...params,
    });
  /**
   * No description
   *
   * @name KanbanUpdate
   * @request PUT:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans/{kanbanId}
   */
  kanbanUpdate = (projectId: string, dbAlias: string, tableId: string, kanbanId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans/${kanbanId}`,
      method: "PUT",
      ...params,
    });
  /**
   * No description
   *
   * @name KanbanDelete
   * @request DELETE:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans/{kanbanId}
   */
  kanbanDelete = (projectId: string, dbAlias: string, tableId: string, kanbanId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans/${kanbanId}`,
      method: "DELETE",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name KanbanRead
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/kanbans/{kanbanId}
   */
  kanbanRead = (projectId: string, dbAlias: string, tableId: string, kanbanId: string, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/kanbans/${kanbanId}`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags View
   * @name ViewsList
   * @request GET:/projects/{projectId}/{dbAlias}/tables/{tableId}/views
   */
  viewsList = (projectId: string, dbAlias: string, tableId: string, params: RequestParams = {}) =>
    this.request<ViewList, any>({
      path: `/projects/${projectId}/${dbAlias}/tables/${tableId}/views`,
      method: "GET",
      ...params,
    });
}
