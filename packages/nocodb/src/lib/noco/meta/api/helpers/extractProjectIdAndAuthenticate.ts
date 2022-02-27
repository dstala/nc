import { promisify } from 'util';

import passport from 'passport';
import Model from '../../../../noco-models/Model';
import View from '../../../../noco-models/View';
export default async (req, res, next) => {
  const { params } = req;

  if (params.projectId) {
    req.ncProjectId = params.projectId;
  } else if (params.tableId) {
    const model = await Model.get({ id: params.tableId });
    req.ncProjectId = model?.project_id;
  } else if (params.viewId) {
    const view = await View.get(params.viewId);
    req.ncProjectId = view?.project_id;
  }

  const user = await new Promise(resolve => {
    passport.authenticate('jwt', { session: false }, (_err, user, _info) => {
      if (user && !req.headers['xc-shared-base-id']) {
        if (
          req.path.indexOf('/user/me') === -1 &&
          req.header('xc-preview') &&
          /(?:^|,)(?:owner|creator)(?:$|,)/.test(user.roles)
        ) {
          return resolve({
            ...user,
            isAuthorized: true,
            roles: req.header('xc-preview')
          });
        }

        return resolve({ ...user, isAuthorized: true });
      }

      if (req.headers['xc-token']) {
        passport.authenticate(
          'authtoken',
          {
            session: false,
            optional: false
          },
          (_err, user, _info) => {
            if (user) {
              return resolve({
                ...user,
                isAuthorized: true,
                roles: user.roles === 'owner' ? 'owner,creator' : user.roles
              });
            } else {
              resolve({ roles: 'guest' });
            }
          }
        )(req, res, next);
      } else if (req.headers['xc-shared-base-id']) {
        passport.authenticate('baseView', {}, (_err, user, _info) => {
          if (user) {
            return resolve({
              ...user,
              isAuthorized: true,
              isPublicBase: true
            });
          } else {
            resolve({ roles: 'guest' });
          }
        })(req, res, next);
      } else {
        resolve({ roles: 'guest' });
      }
    })(req, res, next);
  });

  await promisify((req as any).login.bind(req))(user);
  next();
};
