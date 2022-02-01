import Base, { BaseBody } from '../noco-models/Base';
import Noco from '../noco/Noco';

export default class Project {
  public id: string;
  public title: string;
  public prefix: string;
  public status: string;
  public description: string;
  public meta: string;
  public color: string;
  public deleted: string;
  public order: string;
  public is_meta = false;

  constructor(project: Partial<Project>) {
    Object.assign(this, project);
  }

  public static async createProject(project: ProjectBody) {
    const { id: projectId } = await Noco.ncMeta.metaInsert2(
      null,
      null,
      'nc_projects_v2',
      {
        title: project.title,
        prefix: project.prefix,
        description: project.description,
        is_meta: project.is_meta
      }
    );

    for (const base of project.bases) {
      await Base.createBase({
        ...base,
        projectId
      });
    }
  }
}

export interface ProjectBody {
  title: string;
  prefix?: string;
  description?: string;
  bases?: BaseBody[];
  is_meta?: boolean;
}
