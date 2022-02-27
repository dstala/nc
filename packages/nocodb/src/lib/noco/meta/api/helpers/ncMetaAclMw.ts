import projectAcl from '../../../../utils/projectAcl';
import { NextFunction, Request, Response } from 'express';
import catchError, { NcError } from './catchError';
import extractProjectIdAndAuthenticate from './extractProjectIdAndAuthenticate';
export default function(handlerFn, handlerName = handlerFn.name) {
  return [
    extractProjectIdAndAuthenticate,
    // @ts-ignore
    catchError(
      async (
        req: Request<any, any, any, any, any>,
        _res: Response,
        next: NextFunction
      ) => {
        // if (req['files'] && req.body.json) {
        //   req.body = JSON.parse(req.body.json);
        // }
        // if (req['session']?.passport?.user?.isAuthorized) {
        //   if (
        //     req?.body?.project_id &&
        //     !req['session']?.passport?.user?.isPublicBase &&
        //     !(await this.xcMeta.isUserHaveAccessToProject(
        //       req?.body?.project_id,
        //       req['session']?.passport?.user?.id
        //     ))
        //   ) {
        //     return res
        //       .status(403)
        //       .json({ msg: "User doesn't have project access" });
        //   }
        //
        //   if (req?.body?.api) {

        // todo : verify user have access to project or not

        const roles = req['session']?.passport?.user?.roles;
        const isAllowed =
          roles &&
          Object.entries(roles).some(([name, hasRole]) => {
            return (
              hasRole &&
              projectAcl[name] &&
              (projectAcl[name] === '*' || projectAcl[name][handlerName])
            );
          });
        if (!isAllowed) {
          NcError.forbidden('Not allowed');
        }
        //   }
        // }
        next();
      }
    ),
    catchError(handlerFn)
  ];
}
