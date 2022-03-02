import Base from '../noco-models/Base';
import Noco from '../noco/Noco';
import { ProjectType } from 'nc-common';
import { MetaTable } from '../utils/globals';
import extractDefinedProps from '../noco/meta/api/helpers/extractDefinedProps';

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
        title: projectBody.title,
        prefix: projectBody.prefix,
        description: projectBody.description,
        is_meta: projectBody.is_meta
      }
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
    const projectList = await Noco.ncMeta.metaList2(
      null,
      null,
      MetaTable.PROJECT,
      {
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
      }
    );

    return projectList.map(m => new Project(m));
  }

  // @ts-ignore
  static async get(projectId: string): Promise<Project> {
    const projectData = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.PROJECT,
      projectId
    );
    if (projectData) return new Project(projectData);
    return null;
  }

  async getBases(): Promise<Base[]> {
    return (this.bases = await Base.list({ projectId: this.id }));
  }

  // todo: hide credentials
  // @ts-ignore
  static async getWithInfo(projectId: string): Promise<Project> {
    const projectData = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.PROJECT,
      projectId
    );
    if (projectData) {
      const project = new Project(projectData);
      await project.getBases();
      return project;
    }
    return null;
  }

  // @ts-ignore
  static async softDelete(projectId: string): Promise<any> {
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
    return await Noco.ncMeta.metaUpdate(
      null,
      null,
      MetaTable.PROJECT,
      extractDefinedProps(project, [
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
      ]),
      projectId
    );
  }

  static async delete(projectId, ncMeta = Noco.ncMeta): Promise<any> {
    const bases = await Base.list({ projectId });
    for (const base of bases) {
      await base.delete(ncMeta);
    }
    return await ncMeta.metaDelete(null, null, MetaTable.PROJECT, projectId);
  }

  static async getByUuid(uuid) {
    const projectData = await Noco.ncMeta.metaGet2(
      null,
      null,
      MetaTable.PROJECT,
      { uuid }
    );
    if (projectData) return new Project(projectData);
    return null;
  }
}
