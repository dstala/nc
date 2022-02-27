import { Request, Response, Router } from 'express';
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
import passport from 'passport';

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
        return NcError.badRequest(
          'Not allowed to signup, contact super admin.'
        );
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
    await this.emailClient.mailSend({
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
  const refreshToken = this.randomTokenString();
  await this.users
    .update({
      refresh_token: refreshToken
    })
    .where({
      id: user.id
    });

  this.setTokenCookie(res, refreshToken);

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
      this.config.auth.jwt.secret
    )
  } as any);
}

const router = Router({ mergeParams: true });
router.get('/auth/user/signup', catchError(signup));

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
        const refreshToken = this.randomTokenString();

        await this.users
          .update({
            refresh_token: refreshToken
          })
          .where({ id: user.id });

        this.setTokenCookie(res, refreshToken);

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
            this.config.auth.jwt.secret,
            this.config.auth.jwt.options
          )
        } as any);
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  )(req, res, next);
}

router.get('/auth/user/signin', catchError(signin));
export { router as userApis };
