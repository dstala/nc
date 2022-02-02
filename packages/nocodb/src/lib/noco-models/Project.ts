import Base, { BaseBody } from '../noco-models/Base';
import Noco from '../noco/Noco';
import { Project as ProjectType } from '../noco-client/Api';

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

  constructor(project: Partial<Project>) {
    Object.assign(this, project);
  }

  public static async createProject(projectBody: ProjectBody) {
    const { id: projectId } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      'nc_projects_v2',
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
  }

  // @ts-ignore
  static async list(param): Promise<Project[]> {
    //
  }
  // @ts-ignore
  static async get(projectId: string): Promise<Project[]> {
    const projectData = await Noco.ncMeta.metaGet2(
      null,
      null,
      'nc_projects_v2',
      projectId
    );
    if(pro)
  }
}

export interface ProjectBody {
  title: string;
  prefix?: string;
  description?: string;
  bases?: BaseBody[];
  is_meta?: boolean;
}
