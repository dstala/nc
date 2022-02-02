import SqlMgrv2 from './SqlMgrv2';
import Project from '../../noco-models/Project';

export default class ProjectMgrv2 {
  public static make(): ProjectMgrv2 {
    if (!ProjectMgrv2._instance) {
      ProjectMgrv2._instance = new ProjectMgrv2();
    }
    return ProjectMgrv2._instance;
  }

  private static _instance: ProjectMgrv2;
  private sqlMgrMap: {
    [key: string]: SqlMgrv2;
  };

  constructor() {
    this.sqlMgrMap = {};
  }

  getSqlMgr(project: Project): SqlMgrv2 {
    if (!this.sqlMgrMap[project.id]) {
      this.sqlMgrMap[project.id] = new SqlMgrv2(project);
    }
    return this.sqlMgrMap[project.id];
  }
}
