import { Request, Response } from 'express';
import { TableType } from 'nc-common';
import catchError, { NcError } from '../helpers/catchError';
const { isEmail } = require('validator');
import * as ejs from 'ejs';

import bcrypt from 'bcryptjs';
import { promisify } from 'util';
import User from '../../../../noco-models/User';
import { Tele } from 'nc-help';

const { v4: uuidv4 } = require('uuid');
import * as jwt from 'jsonwebtoken';
import Audit from '../../../../noco-models/Audit';
import crypto from 'crypto';
import NcPluginMgrv2 from '../helpers/NcPluginMgrv2';

// todo: read from database
const secret = 'dkjfkdjfkjdfjdfjdkfjdkfjkdfkjdkfjdkjfkdk';
const jwtConfig = {};

import XcCache from '../../../plugins/adapters/cache/XcCache';

import passport from 'passport';
import ProjectUser from '../../../../noco-models/ProjectUser';
import { ExtractJwt, Strategy } from 'passport-jwt';
import extractProjectIdAndAuthenticate from '../helpers/extractProjectIdAndAuthenticate';

const PassportLocalStrategy = require('passport-local').Strategy;
// todo: read from database
const jwtOptions = {
  secretOrKey: 'dkjfkdjfkjdfjdfjdkfjdkfjkdfkjdkfjdkjfkdk',
  expiresIn: process.env.NC_JWT_EXPIRES_IN ?? '10h',
  jwtFromRequest: ExtractJwt.fromHeader('xc-auth')
};

export function initJwtStrategy(router): void {
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

  router.use(passport.initialize());
}

export async function signup(req: Request, res: Response<TableType>) {
  const {
    email: _email,
    firstname,
    lastname,
    token,
    ignore_subscribe
  } = req.body;
  let { password } = req.body;

  if (!isEmail(_email)) {
    NcError.badRequest(`Invalid email`);
  }

  const email = _email.toLowerCase();

  let user = await User.getByEmail(email);

  if (user) {
    if (token) {
      if (token !== user.invite_token) {
        NcError.badRequest(`Invalid invite url`);
      } else if (user.invite_token_expires < new Date()) {
        NcError.badRequest(
          'Expired invite url, Please contact super admin to get a new invite url'
        );
      }
    } else {
      // todo : opening up signup for timebeing
      // return next(new Error(`Email '${email}' already registered`));
    }
  }

  const salt = await promisify(bcrypt.genSalt)(10);
  password = await promisify(bcrypt.hash)(password, salt);
  const email_verification_token = uuidv4();

  if (!ignore_subscribe) {
    Tele.emit('evt_subscribe', email);
  }

  if (user) {
    if (token) {
      await User.update(user.id, {
        firstname,
        lastname,
        salt,
        password,
        email_verification_token,
        invite_token: null,
        invite_token_expires: null
      });
    } else {
      NcError.badRequest('User already exist');
    }
  } else {
    let roles = 'user';

    if (await User.isFirst()) {
      // todo: update in nc_store
      // roles = 'owner,creator,editor'
      Tele.emit('evt', { evt_type: 'project:invite', count: 1 });
    } else {
      if (process.env.NC_INVITE_ONLY_SIGNUP) {
        NcError.badRequest('Not allowed to signup, contact super admin.');
      } else {
        roles = 'user_new';
      }
    }

    await User.insert({
      firstname,
      lastname,
      email,
      salt,
      password,
      email_verification_token,
      roles
    });
  }
  user = await User.getByEmail(email);

  try {
    const template = (await import('./ui/emailTemplates/verify')).default;
    await (await NcPluginMgrv2.emailAdapter()).mailSend({
      to: email,
      subject: 'Verify email',
      html: ejs.render(template, {
        verifyLink:
          (req as any).ncSiteUrl +
          `/email/verify/${user.email_verification_token}`
      })
    });
  } catch (e) {
    console.log(
      'Warning : `mailSend` failed, Please configure emailClient configuration.'
    );
  }
  await promisify((req as any).login.bind(req))(user);
  const refreshToken = randomTokenString();
  await User.update(user.id, {
    refresh_token: refreshToken
  });

  setTokenCookie(res, refreshToken);

  user = (req as any).user;

  Audit.insert({
    op_type: 'AUTHENTICATION',
    op_sub_type: 'SIGNUP',
    user: user.email,
    description: `signed up `,
    ip: (req as any).clientIp
  });

  res.json({
    token: jwt.sign(
      {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        id: user.id,
        roles: user.roles
      },
      secret
    )
  } as any);
}

async function signin(req, res, next) {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info): Promise<any> => {
      try {
        if (!user || !user.email) {
          if (err) {
            return res.status(400).send(err);
          }
          if (info) {
            return res.status(400).send(info);
          }
          return res.status(400).send({ msg: 'Your signin has failed' });
        }

        await promisify((req as any).login.bind(req))(user);
        const refreshToken = randomTokenString();

        await User.update(user.id, {
          refresh_token: refreshToken
        });
        setTokenCookie(res, refreshToken);

        Audit.insert({
          op_type: 'AUTHENTICATION',
          op_sub_type: 'SIGNIN',
          user: user.email,
          ip: req.clientIp,
          description: `signed in`
        });

        res.json({
          token: jwt.sign(
            {
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              id: user.id,
              roles: user.roles
            },
            secret,
            jwtConfig
          )
        } as any);
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  )(req, res, next);
}

function randomTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}
function setTokenCookie(res, token): void {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
  res.cookie('refresh_token', token, cookieOptions);
}

async function me(req, res): Promise<any> {
  res.json(req?.session?.passport?.user ?? {});
}

const mapRoutes = router => {
  // todo: old api - /auth/signup?tool=1
  router.post('/auth/user/signup', catchError(signup));

  router.post('/auth/user/signin', catchError(signin));

  router.get('/auth/user/me', extractProjectIdAndAuthenticate, catchError(me));
};
export { mapRoutes as userApis };
