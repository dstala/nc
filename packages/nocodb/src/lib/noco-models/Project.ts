import Base from '../noco-models/Base';
import Noco from '../noco/Noco';
import { ProjectType } from 'nc-common';
import {
  CacheDelDirection,
  CacheGetType,
  CacheScope,
  MetaTable
} from '../utils/globals';
import extractProps from '../noco/meta/api/helpers/extractProps';
import NocoCache from '../noco-cache/NocoCache';

export default class Project implements ProjectType {
  public id: string;
  public title: string;
  public prefix: string;
  public status: string;
  public description: string;
  public meta: string;
  public color: string;
  public deleted: string;
  public order: number;
  public is_meta = false;
  public bases?: Base[];

  // shared base props
  uuid?: string;
  password?: string;
  roles?: string;

  constructor(project: Partial<Project>) {
    Object.assign(this, project);
  }

  public static async createProject(
    projectBody: ProjectType
  ): Promise<Project> {
    const { id: projectId } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      MetaTable.PROJECT,
      {
        id: projectBody?.id,
        title: projectBody.title,
        prefix: projectBody.prefix,
        description: projectBody.description,
        is_meta: projectBody.is_meta
      }
    );

    await NocoCache.appendToList(
      CacheScope.PROJECT,
      [],
      `${CacheScope.PROJECT}:${projectId}`
    );

    for (const base of projectBody.bases) {
      await Base.createBase({
        ...base,
        projectId
      });
    }
    return this.getWithInfo(projectId);
  }

  // @ts-ignore
  static async list(param): Promise<Project[]> {
    let projectList = await NocoCache.getList(CacheScope.PROJECT, []);
    if (!projectList.length) {
      projectList = await Noco.ncMeta.metaList2(null, null, MetaTable.PROJECT, {
        xcCondition: {
          _or: [
            {
              deleted: {
                eq: false
              }
            },
            {
              deleted: {
                eq: null
              }
            }
          ]
        }
      });
      await NocoCache.setList(CacheScope.PROJECT, [], projectList);
    }
    projectList = projectList.filter(
      p => p.deleted === 0 || p.deleted === false || p.deleted === null
    );
    return projectList.map(m => new Project(m));
  }

  // @ts-ignore
  static async get(projectId: string): Promise<Project> {
    let projectData =
      projectId &&
      (await NocoCache.get(
        `${CacheScope.PROJECT}:${projectId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!projectData) {
      projectData = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.PROJECT,
        projectId
      );
      await NocoCache.set(`${CacheScope.PROJECT}:${projectId}`, projectData);
    }
    return projectData && new Project(projectData);
  }

  async getBases(): Promise<Base[]> {
    return (this.bases = await Base.list({ projectId: this.id }));
  }

  // todo: hide credentials
  // @ts-ignore
  static async getWithInfo(projectId: string): Promise<Project> {
    let projectData =
      projectId &&
      (await NocoCache.get(
        `${CacheScope.PROJECT}:${projectId}`,
        CacheGetType.TYPE_OBJECT
      ));
    if (!projectData) {
      projectData = await Noco.ncMeta.metaGet2(
        null,
        null,
        MetaTable.PROJECT,
        projectId
      );
      await NocoCache.set(`${CacheScope.PROJECT}:${projectId}`, projectData);
      if (projectData.uuid) {
        await NocoCache.set(
          `${CacheScope.PROJECT}:${projectData.uuid}`,
          projectId
        );
      }
    }
    if (projectData) {
      const project = new Project(projectData);
      await project.getBases();
      return project;
    }
    return null;
  }

  // @ts-ignore
  static async softDelete(projectId: string): Promise<any> {
    // get existing cache
    const key = `${CacheScope.PROJECT}:${projectId}`;
    const o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o.uuid) {
      await NocoCache.del(`${CacheScope.PROJECT}:${o.uuid}`);
    }
    await NocoCache.del(`${CacheScope.PROJECT}:${projectId}`);

    // remove item in cache list
    await NocoCache.deepDel(
      CacheScope.PROJECT,
      `${CacheScope.PROJECT}:${projectId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );

    // set meta
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.PROJECT,
      { deleted: true },
      projectId
    );
  }

  // @ts-ignore
  static async update(
    projectId: string,
    project: Partial<Project>
  ): Promise<any> {
    const updateObj = extractProps(project, [
      'title',
      'prefix',
      'status',
      'description',
      'meta',
      'color',
      'deleted',
      'order',
      'bases',
      'uuid',
      'password',
      'roles'
    ]);
    // get existing cache
    const key = `${CacheScope.PROJECT}:${projectId}`;
    let o = await NocoCache.get(key, CacheGetType.TYPE_OBJECT);
    if (o) {
      // update data
      if (o.uuid && updateObj.uuid && o.uuid !== updateObj.uuid) {
        await NocoCache.del(`${CacheScope.PROJECT}:${o.uuid}`);
        await NocoCache.set(
          `${CacheScope.PROJECT}:${updateObj.uuid}`,
          projectId
        );
      }
      o = { ...o, ...updateObj };
      // set cache
      await NocoCache.set(key, o);
    }
    // set meta
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.PROJECT,
      updateObj,
      projectId
    );
  }

  static async delete(projectId, ncMeta = Noco.ncMeta): Promise<any> {
    const bases = await Base.list({ projectId });
    for (const base of bases) {
      await base.delete(ncMeta);
    }
    const project = await this.get(projectId);
    if (project.uuid) {
      await NocoCache.del(`${CacheScope.PROJECT}:${project.uuid}`);
    }
    await NocoCache.deepDel(
      CacheScope.PROJECT,
      `${CacheScope.PROJECT}:${projectId}`,
      CacheDelDirection.CHILD_TO_PARENT
    );
    return await ncMeta.metaDelete(null, null, MetaTable.PROJECT, projectId);
  }

  static async getByUuid(uuid) {
    const projectId =
      uuid &&
      (await NocoCache.get(
        `${CacheScope.PROJECT}:${uuid}`,
        CacheGetType.TYPE_OBJECT
      ));
    let projectData = null;
    if (!projectId) {
      projectData = await Noco.ncMeta.metaGet2(null, null, MetaTable.PROJECT, {
        uuid
      });
      await NocoCache.set(`${CacheScope.PROJECT}:${uuid}`, projectData?.id);
    } else {
      return this.get(projectId);
    }
    return projectData?.id && this.get(projectData?.id);
  }
}
