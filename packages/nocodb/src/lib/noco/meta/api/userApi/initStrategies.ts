import XcCache from '../../../plugins/adapters/cache/XcCache';
import User from '../../../../noco-models/User';
import ProjectUser from '../../../../noco-models/ProjectUser';
import { promisify } from 'util';
import { Strategy as CustomStrategy } from 'passport-custom';

import { Strategy } from 'passport-jwt';
import passport from 'passport';
import { ExtractJwt } from 'passport-jwt';

const PassportLocalStrategy = require('passport-local').Strategy;
// todo: read from database
const jwtOptions = {
  secretOrKey: 'dkjfkdjfkjdfjdfjdkfjdkfjkdfkjdkfjdkjfkdk',
  expiresIn: process.env.NC_JWT_EXPIRES_IN ?? '10h',
  jwtFromRequest: ExtractJwt.fromHeader('xc-auth')
};
import bcrypt from 'bcryptjs';
import Project from '../../../../noco-models/Project';

export function initStrategies(router): void {
  passport.serializeUser(function(
    {
      id,
      email,
      email_verified,
      roles: _roles,
      provider,
      firstname,
      lastname,
      isAuthorized,
      isPublicBase
    },
    done
  ) {
    const roles = (_roles || '')
      .split(',')
      .reduce((obj, role) => Object.assign(obj, { [role]: true }), {});
    if (roles.owner) {
      roles.creator = true;
    }
    done(null, {
      isAuthorized,
      isPublicBase,
      id,
      email,
      email_verified,
      provider,
      firstname,
      lastname,
      roles
    });
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(
    new Strategy(
      {
        ...jwtOptions,
        passReqToCallback: true
      },
      (req, jwtPayload, done) => {
        // todo : redis-get
        const keyVals = [jwtPayload?.email];
        if (req.ncProjectId) {
          keyVals.push(req.ncProjectId);
        }
        const key = keyVals.join('___');
        const cachedVal = XcCache.get(key);
        if (cachedVal) {
          return done(null, cachedVal);
        }

        User.getByEmail(jwtPayload?.email)
          .then(user => {
            if (req.ncProjectId) {
              // this.xcMeta
              //   .metaGet(req.ncProjectId, null, 'nc_projects_users', {
              //     user_id: user?.id
              //   })

              ProjectUser.get(req.ncProjectId, user.id)
                .then(projectUser => {
                  user.roles = projectUser?.roles || 'user';
                  user.roles =
                    user.roles === 'owner' ? 'owner,creator' : user.roles;
                  // + (user.roles ? `,${user.roles}` : '');

                  // todo : redis-set
                  XcCache.set(key, user);
                  done(null, user);
                })
                .catch(e => done(e));
            } else {
              // const roles = projectUser?.roles ? JSON.parse(projectUser.roles) : {guest: true};
              if (user) {
                // todo : redis-set
                XcCache.set(key, user);
                return done(null, user);
              } else {
                return done(new Error('User not found'));
              }
            }
          })
          .catch(err => {
            return done(err);
          });
      }
    )
  );

  passport.use(
    new PassportLocalStrategy(
      {
        usernameField: 'email',
        session: false
      },
      async (email, password, done) => {
        try {
          const user = await User.getByEmail(email);
          if (!user) {
            return done({ msg: `Email ${email} is not registered!` });
          }
          const hashedPassword = await promisify(bcrypt.hash)(
            password,
            user.salt
          );
          if (user.password !== hashedPassword) {
            return done({ msg: `Password not valid!` });
          } else {
            return done(null, user);
          }
        } catch (e) {
          done(e);
        }
      }
    )
  );

  passport.use(
    'baseView',
    new CustomStrategy(async (req: any, callback) => {
      let user;
      if (req.headers['xc-shared-base-id']) {
        // const cacheKey = `nc_shared_bases||${req.headers['xc-shared-base-id']}`;

        // todo : redis get
        let sharedProject = null; // XcCache.get(cacheKey);

        if (!sharedProject) {
          sharedProject = await Project.getByUuid(
            req.headers['xc-shared-base-id']
          );

          // todo : redis set
          // XcCache.set(cacheKey, { roles: sharedProject?.roles });
        }
        user = {
          roles: sharedProject?.roles
        };
      }

      callback(null, user);
    })
  );

  router.use(passport.initialize());
}
