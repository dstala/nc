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

import { User } from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Auth<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags AUTH
   * @name Signup
   * @summary Signup
   * @request POST:/auth/user/signup
   */
  signup = (data: { email?: boolean; password?: string }, params: RequestParams = {}) =>
    this.request<{ email: string; password: string }, any>({
      path: `/auth/user/signup`,
      method: "POST",
      body: data,
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name Me
   * @summary User Info
   * @request GET:/auth/user/me
   */
  me = (params: RequestParams = {}) =>
    this.request<User, any>({
      path: `/auth/user/me`,
      method: "GET",
      format: "json",
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name Signin
   * @summary Signin
   * @request POST:/auth/user/signin
   */
  signin = (data: { email: string; password: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/user/signin`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name PasswordForgot
   * @summary Password Forgot
   * @request POST:/auth/password/forgot
   */
  passwordForgot = (data: { email?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/password/forgot`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name PasswordChange
   * @summary Password Change
   * @request POST:/auth/password/change
   */
  passwordChange = (
    data: { old_password?: string; new_password?: string; new_password_repeat?: string },
    params: RequestParams = {},
  ) =>
    this.request<void, any>({
      path: `/auth/password/change`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name PasswordReset
   * @summary Password Reset
   * @request POST:/auth/password/reset
   */
  passwordReset = (data: { reset_token?: string; new_password?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/password/reset`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name TokenVerify
   * @summary Password Verify
   * @request POST:/auth/token/verify
   */
  tokenVerify = (data: { token?: string; email?: string }, params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/token/verify`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags AUTH
   * @name TokenRefresh
   * @summary Password Refresh
   * @request POST:/auth/token/refresh
   */
  tokenRefresh = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/auth/token/refresh`,
      method: "POST",
      ...params,
    });
}
