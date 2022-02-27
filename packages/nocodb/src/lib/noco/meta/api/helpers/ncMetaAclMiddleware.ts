import projectAcl from '../../../../utils/projectAcl';
import { NextFunction, Request, Response } from 'express';
import extractProjectIdAndAuthenticate from './extractProjectIdAndAuthenticate';
export default function(actName) {
  return [
    extractProjectIdAndAuthenticate,
    // @ts-ignore
    async (
      req: Request<any, any, any, any, any>,
      res: Response,
      next: NextFunction
    ) => {
      if (req['files'] && req.body.json) {
        req.body = JSON.parse(req.body.json);
      }
      if (req['session']?.passport?.user?.isAuthorized) {
        if (
          req?.body?.project_id &&
          !req['session']?.passport?.user?.isPublicBase &&
          !(await this.xcMeta.isUserHaveAccessToProject(
            req?.body?.project_id,
            req['session']?.passport?.user?.id
          ))
        ) {
          return res
            .status(403)
            .json({ msg: "User doesn't have project access" });
        }

        if (req?.body?.api) {
          const roles = req['session']?.passport?.user?.roles;
          const isAllowed =
            roles &&
            Object.entries(roles).some(([name, hasRole]) => {
              return (
                hasRole &&
                projectAcl[name] &&
                (projectAcl[name] === '*' || projectAcl[name][actName])
              );
            });
          if (!isAllowed) {
            return res.status(403).json({ msg: 'Not allowed' });
          }
        }
      }
      next();
    }
  ];
}
