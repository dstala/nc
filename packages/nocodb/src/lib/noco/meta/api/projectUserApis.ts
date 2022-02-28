import ncMetaAclMw from './helpers/ncMetaAclMw';
import { Router } from 'express';
import { PagedResponseImpl } from './helpers/PagedResponse';
import ProjectUser from '../../../noco-models/ProjectUser';
import validator from 'validator';
import XcCache from '../../plugins/adapters/cache/XcCache';
import { NcError } from './helpers/catchError';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../noco-models/User';
import { Tele } from 'nc-help';

async function userList(req, res) {
  res.json({
    users: new PagedResponseImpl(
      await ProjectUser.getUsersList({
        ...req.query,
        project_id: req.params.projectId
      }),
      {
        totalRows: await ProjectUser.getUsersCount(req.query)
      }
    )
  });
}

async function userInvite(req, res, next): Promise<any> {
  const emails = (req.body.email || '')
    .toLowerCase()
    .split(/\s*,\s*/)
    .map(v => v.trim());

  // check for invalid emails
  const invalidEmails = emails.filter(v => !validator.isEmail(v));
  if (!emails.length) {
    return NcError.badRequest('Invalid email address');
  }
  if (invalidEmails.length) {
    NcError.badRequest('Invalid email address : ' + invalidEmails.join(', '));
  }

  const invite_token = uuidv4();
  const error = [];

  for (const email of emails) {
    // add user to project if user already exist
    const user = await User.getByEmail(email);
    if (user) {
      // todo : provide a different role
      await User.update(user.id, {
        roles: 'user'
      });

      if (
        !(await this.xcMeta.isUserHaveAccessToProject(
          req.body.project_id,
          user.id
        ))
      ) {
        await this.xcMeta.projectAddUser(
          req.body.project_id,
          user.id,
          'editor'
        );
      }
      this.xcMeta.audit(req.body.project_id, null, 'nc_audit', {
        op_type: 'AUTHENTICATION',
        op_sub_type: 'INVITE',
        user: req.user.email,
        description: `invited ${email} to ${req.body.project_id} project `,
        ip: req.clientIp
      });
    } else {
      try {
        // create new user with invite token
        await this.users.insert({
          invite_token,
          invite_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          email,
          roles: 'user'
        });

        const { id } = await this.users.where({ email }).first();
        const count = await this.users.count('id as count').first();
        // add user to project
        await this.xcMeta.projectAddUser(
          req.body.project_id,
          id,
          req.body.roles
        );

        Tele.emit('evt', { evt_type: 'project:invite', count: count?.count });

        this.xcMeta.audit(req.body.project_id, null, 'nc_audit', {
          op_type: 'AUTHENTICATION',
          op_sub_type: 'INVITE',
          user: req.user.email,
          description: `invited ${email} to ${req.body.project_id} project `,
          ip: req.clientIp
        });
        // in case of single user check for smtp failure
        // and send back token if failed
        if (
          emails.length === 1 &&
          !(await this.sendInviteEmail(email, invite_token, req))
        ) {
          return res.json({ invite_token, email });
        } else {
          this.sendInviteEmail(email, invite_token, req);
        }
      } catch (e) {
        if (emails.length === 1) {
          return next(e);
        } else {
          error.push({ email, error: e.message });
        }
      }
    }
  }

  if (emails.length === 1) {
    res.json({
      msg: 'success'
    });
  } else {
    return res.json({ invite_token, emails, error });
  }
}

// @ts-ignore
async function updateAdmin(req, res, next): Promise<any> {
  if (!req?.body?.project_id) {
    return next(new Error('Missing project id in request body.'));
  }

  if (
    req.session?.passport?.user?.roles?.owner &&
    req.session?.passport?.user?.id === +req.params.id &&
    req.body.roles.indexOf('owner') === -1
  ) {
    return next(new Error("Super admin can't remove Super role themselves"));
  }
  try {
    const user = await this.users
      .where({
        id: req.params.id
      })
      .first();

    if (!user) {
      return next(`User with id '${req.params.id}' doesn't exist`);
    }

    // todo: handle roles which contains super
    if (
      !req.session?.passport?.user?.roles?.owner &&
      req.body.roles.indexOf('owner') > -1
    ) {
      return next(new Error('Insufficient privilege to add super admin role.'));
    }

    // await this.users.update({
    //   roles: req.body.roles
    // }).where({
    //   id: req.params.id
    // });

    await this.xcMeta.metaUpdate(
      req?.body?.project_id,
      null,
      'nc_projects_users',
      {
        roles: req.body.roles
      },
      {
        user_id: req.params.id
        // email: req.body.email
      }
    );

    XcCache.del(`${req.body.email}___${req?.body?.project_id}`);

    this.xcMeta.audit(null, null, 'nc_audit', {
      op_type: 'AUTHENTICATION',
      op_sub_type: 'ROLES_MANAGEMENT',
      user: req.user.email,
      description: `updated roles for ${user.email} with ${req.body.roles} `,
      ip: req.clientIp
    });

    res.json({
      msg: 'User details updated successfully'
    });
  } catch (e) {
    next(e);
  }
}

const router = Router({ mergeParams: true });
router.get('/projects/:projectId/users', ncMetaAclMw(userList));
router.post('/projects/:projectId/users', ncMetaAclMw(userInvite));
export default router;
