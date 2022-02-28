import { MetaTable } from '../utils/globals';
import Noco from '../noco/Noco';

export default class ProjectUser {
  project_id: string;
  fk_user_id: string;
  roles?: string;

  constructor(data: ProjectUser) {
    Object.assign(this, data);
  }

  public static async insert(
    projectUser: Partial<ProjectUser>,
    ncMeta = Noco.ncMeta
  ) {
    return await ncMeta.metaInsert2(
      null,
      null,
      MetaTable.PROJECT_USERS,
      {
        fk_user_id: projectUser.fk_user_id,
        project_id: projectUser.project_id,
        roles: projectUser.roles
      },
      true
    );
  }

  // public static async update(id, user: Partial<ProjectUser>, ncMeta = Noco.ncMeta) {
  //   // return await ncMeta.metaUpdate(null, null, MetaTable.USERS, id, insertObj);
  // }
  static async get(projectId: string, userId: string, ncMeta = Noco.ncMeta) {
    return await ncMeta.metaGet2(null, null, MetaTable.PROJECT_USERS, {
      fk_user_id: userId,
      project_id: projectId
    });
  }

  public static async getUsersList(
    {
      project_id,
      limit = 25,
      offset = 0,
      query
    }: {
      project_id: string;
      limit: number;
      offset: number;
      query?: string;
    },
    ncMeta = Noco.ncMeta
  ) {
    const queryBuilder = ncMeta
      .knex(MetaTable.USERS)
      .select(
        `${MetaTable.USERS}.id`,
        `${MetaTable.USERS}.email`,
        `${MetaTable.USERS}.invite_token`,
        `${MetaTable.USERS}.roles as main_roles`,
        `${MetaTable.PROJECT_USERS}.project_id`,
        `${MetaTable.PROJECT_USERS}.roles as roles`
      )
      .offset(offset)
      .limit(limit);

    if (query) {
      queryBuilder.where('email', 'like', `%${query.toLowerCase?.()}%`);
    }

    queryBuilder.leftJoin(MetaTable.PROJECT_USERS, function() {
      this.on(
        `${MetaTable.PROJECT_USERS}.fk_user_id`,
        '=',
        `${MetaTable.USERS}.id`
      ).andOn(
        `${MetaTable.PROJECT_USERS}.project_id`,
        '=',
        ncMeta.knex.raw('?', [project_id])
      );
    });

    console.log(queryBuilder.toQuery());

    return await queryBuilder;
  }

  public static async getUsersCount(
    {
      query
    }: {
      query?: string;
    },
    ncMeta = Noco.ncMeta
  ): Promise<number> {
    const qb = ncMeta.knex(MetaTable.USERS);

    if (query) {
      qb.where('email', 'like', `%${query.toLowerCase?.()}%`);
    }

    return (await qb.count('id', { as: 'count' }).first()).count;
  }

  static async update(projectId, userId, roles: string, ncMeta = Noco.ncMeta) {
    return await ncMeta.metaUpdate(
      null,
      null,
      MetaTable.PROJECT_USERS,
      {
        roles
      },
      {
        fk_user_id: userId,
        project_id: projectId
      }
    );
  }

  static async delete(projectId: string, userId, ncMeta = Noco.ncMeta) {
    return await ncMeta.metaDelete(null, null, MetaTable.PROJECT_USERS, {
      fk_user_id: userId,
      project_id: projectId
    });
  }
}
