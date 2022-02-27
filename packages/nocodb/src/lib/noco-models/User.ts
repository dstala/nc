import { UserType } from 'nc-common';
import { MetaTable } from '../utils/globals';
import Noco from '../noco/Noco';
import extractDefinedProps from '../noco/meta/api/helpers/extractDefinedProps';
export default class User implements UserType {
  id: number;

  /** @format email */
  email: string;

  password?: string;
  salt?: string;
  firstname: string;
  lastname: string;
  username?: string;
  refresh_token?: string;
  invite_token?: string;
  invite_token_expires?: string;
  reset_password_expires?: number | Date;
  reset_password_token?: string;
  email_verification_token?: string;
  email_verified: boolean;
  roles?: string;

  constructor(data: User) {
    Object.assign(this, data);
  }

  public static async insert(user: Partial<User>, ncMeta = Noco.ncMeta) {
    const insertObj = extractDefinedProps(user, [
      'email',
      'password',
      'salt',
      'firstname',
      'lastname',
      'username',
      'refresh_token',
      'invite_token',
      'invite_token_expires',
      'reset_password_expires',
      'reset_password_token',
      'email_verification_token',
      'email_verified',
      'roles'
    ]);
    return await ncMeta.metaInsert2(null, null, MetaTable.USERS, insertObj);
  }
  public static async update(id, user: Partial<User>, ncMeta = Noco.ncMeta) {
    const insertObj = extractDefinedProps(user, [
      'email',
      'password',
      'salt',
      'firstname',
      'lastname',
      'username',
      'refresh_token',
      'invite_token',
      'invite_token_expires',
      'reset_password_expires',
      'reset_password_token',
      'email_verification_token',
      'email_verified',
      'roles'
    ]);
    return await ncMeta.metaUpdate(null, null, MetaTable.USERS, id, insertObj);
  }
  public static async getByEmail(email, ncMeta = Noco.ncMeta) {
    return await ncMeta.metaGet2(null, null, MetaTable.USERS, {
      email
    });
  }

  static async isFirst(ncMeta = Noco.ncMeta) {
    return !(await ncMeta.metaGet2(null, null, MetaTable.USERS, {}));
  }
}
