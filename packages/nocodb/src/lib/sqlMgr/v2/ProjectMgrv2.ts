import SqlMgrv2 from './SqlMgrv2';

export default class ProjectMgrv2 {
  private static sqlMgrMap: {
    [key: string]: SqlMgrv2;
  } = {};

  public static getSqlMgr(project: { id: string }): SqlMgrv2 {
    if (!this.sqlMgrMap[project.id]) {
      this.sqlMgrMap[project.id] = new SqlMgrv2(project);
    }
    return this.sqlMgrMap[project.id];
  }
}
