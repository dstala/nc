import { expect } from 'chai';
import 'mocha';
import express from 'express';
import request from 'supertest';

import { Noco } from '../lib';
import NcConfigFactory from '../lib/utils/NcConfigFactory';

process.env.TEST = 'test';
process.env[`DATABASE_URL`] = 'mysql2://root:password@localhost:3306/test12';

let projectId;
let token;
const dbConfig = NcConfigFactory.urlToDbConfig(
  NcConfigFactory.extractXcUrlFromJdbc(process.env[`DATABASE_URL`])
);
dbConfig.connection.database = 'sakila';
dbConfig.meta = {
  tn: 'nc_evolutions',
  dbAlias: 'db',
  api: {
    type: 'rest',
    prefix: '',
    graphqlDepthLimit: 10
  },
  inflection: {
    tn: 'camelize',
    cn: 'camelize'
  }
} as any;
const projectCreateReqBody = {
  api: 'projectCreateByWeb',
  query: { skipProjectHasDb: 1 },
  args: {
    project: { title: 'restv2', folder: 'config.xc.json', type: 'pg' },
    projectJson: {
      title: 'restv2',
      version: '0.6',
      envs: {
        _noco: {
          db: [dbConfig],
          apiClient: { data: [] }
        }
      },
      workingEnv: '_noco',
      meta: {
        version: '0.6',
        seedsFolder: 'seeds',
        queriesFolder: 'queries',
        apisFolder: 'apis',
        projectType: 'rest',
        type: 'mvc',
        language: 'ts',
        db: { client: 'sqlite3', connection: { filename: 'noco.db' } }
      },
      seedsFolder: 'seeds',
      queriesFolder: 'queries',
      apisFolder: 'apis',
      projectType: 'rest',
      type: 'docker',
      language: 'ts',
      apiClient: { data: [] },
      auth: {
        jwt: { secret: 'b8ed266d-4475-4028-8c3d-590f58bee867', dbAlias: 'db' }
      }
    }
  }
};

// console.log(JSON.stringify(dbConfig, null, 2));
// process.exit();
describe('{Auth, CRUD, HasMany, Belongs} Tests', () => {
  let app;

  // Called once before any of the tests in this block begin.
  before(function(done) {
    this.timeout(200000);

    (async () => {
      const server = express();

      server.use(await Noco.init());
      app = server;
      // await knex(config.envs[process.env.NODE_ENV || 'dev'].db[0])('xc_users').del();
    })()
      .then(done)
      .catch(e => {
        done(e);
      });
  });

  after(done => {
    done();
    // process.exit();
  });

  /**************** START : Auth ****************/
  describe('Authentication', function() {
    this.timeout(10000);
    const EMAIL_ID = 'abc@g.com';
    const VALID_PASSWORD = '1234566778';

    it('Signup with valid email', function(done) {
      this.timeout(60000);
      request(app)
        .post('/auth/signup')
        .send({ email: EMAIL_ID, password: VALID_PASSWORD })
        .expect(200, (err, res) => {
          if (err) {
            expect(res.status).to.equal(400);
          } else {
            const token = res.body.token;
            expect(token).to.be.a('string');
          }
          done();
        });
    });

    it('Signup with invalid email', done => {
      request(app)
        .post('/auth/signup')
        .send({ email: 'test', password: VALID_PASSWORD })
        .expect(400, done);
    });

    it('Signin with valid credentials', function(done) {
      request(app)
        .post('/auth/signin')
        .send({ email: EMAIL_ID, password: VALID_PASSWORD })
        .expect(200, async function(err, res) {
          if (err) {
            return done(err);
          }
          token = res.body.token;
          expect(token).to.be.a('string');
          // todo: verify jwt token payload
          // const payload: any = await JWT.verifyToken(token, config.auth.jwt.secret, config.auth.jwt.options)
          // expect(payload.email).to.eq(EMAIL_ID)
          // expect(payload.roles).to.eq('owner,creator,editor')
          done();
        });
    });

    it('me', function(done) {
      request(app)
        .get('/user/me')
        .set('xc-auth', token)
        .expect(200, function(err, res) {
          if (err) {
            return done(err);
          }
          const email = res.body.email;
          expect(email).to.equal(EMAIL_ID);
          done();
        });
    });

    it('Change password', function(done) {
      request(app)
        .post('/user/password/change')
        .set('xc-auth', token)
        .send({ currentPassword: 'password', newPassword: 'password' })
        .expect(400, done);
    });

    it('Change password - after logout', function(done) {
      // todo:
      request(app)
        .post('/user/password/change')
        .send({ currentPassword: 'password', newPassword: 'password' })
        .expect(500, function(_err, _res) {
          done();
        });
    });

    it('Signin with invalid credentials', function(done) {
      request(app)
        .post('/auth/signin')
        .send({ email: 'abc@abc.com', password: VALID_PASSWORD })
        .expect(400, done);
    });

    it('Signin with invalid password', function(done) {
      request(app)
        .post('/auth/signin')
        .send({ email: EMAIL_ID, password: 'wrongPassword' })
        .expect(400, done);
    });

    it('Forgot password with a non-existing email id', function(done) {
      request(app)
        .post('/auth/password/forgot')
        .send({ email: 'abc@abc.com' })
        .expect(400, done);
    });

    it('Forgot password with an existing email id', function(done) {
      this.timeout(10000);
      request(app)
        .post('/auth/password/forgot')
        .send({ email: EMAIL_ID })
        .expect(200, done);
    });

    it('Email validate with an invalid token', function(done) {
      request(app)
        .post('/auth/email/validate/someRandomValue')
        .send({ email: EMAIL_ID })
        .expect(400, done);
    });

    it('Email validate with a valid token', function(done) {
      console.log('eeee');

      // todo :
      done();

      // request(app)
      //   .post('/auth/email/validate/someRandomValue')
      //   .send({email: EMAIL_ID})
      //   .expect(500, done);
    });

    it('Forgot password validate with an invalid token', function(done) {
      request(app)
        .post('/auth/token/validate/someRandomValue')
        .send({ email: EMAIL_ID })
        .expect(400, done);
    });

    it('Forgot password validate with a valid token', function(done) {
      // todo

      done();

      // request(app)
      //   .post('/auth/token/validate/someRandomValue')
      //   .send({email: EMAIL_ID})
      //   .expect(500, done);
    });

    it('Reset Password with an invalid token', function(done) {
      request(app)
        .post('/auth/password/reset/someRandomValue')
        .send({ password: 'anewpassword' })
        .expect(400, done);
    });

    it('Reset Password with an valid token', function(done) {
      //todo
      done();

      // request(app)
      //   .post('/auth/password/reset/someRandomValue')
      //   .send({password: 'anewpassword'})
      //   .expect(500, done);
    });
  });

  describe('Project', function() {
    const EMAIL_ID = 'abc@g.com';
    const VALID_PASSWORD = '1234566778';

    before(function(done) {
      this.timeout(120000);
      request(app)
        .post('/auth/signin')
        .send({ email: EMAIL_ID, password: VALID_PASSWORD })
        .expect(200, async function(_err, res) {
          token = res.body.token;
          request(app)
            .post('/dashboard')
            .set('xc-auth', token)
            .send(projectCreateReqBody)
            .expect(200, (err, res) => {
              if (err) {
                return done(err);
              }
              projectId = res.body.id;
              done();
            });
        });
    });

    /**************** START : CRUD ****************/
    describe('Nested APIs', function() {
      it('list with nested has many : GET - /api/v2/country', function(done) {
        console.log(`/nc/${projectId}/api/v2/country`);
        request(app)
          .get(`/nc/${projectId}/api/v2/country`)
          .set('xc-auth', token)
          .expect(200, (err, res) => {
            if (err) done(err);

            expect(res.body?.CountryList).to.be.an('Array');
            expect(res.body?.CountryList[0]).to.have.property('Country');
            expect(res.body?.CountryList[0]).to.have.property('CountryId');
            expect(res.body?.CountryList[0]).to.have.property(
              'Country => City'
            );
            expect(res.body?.CountryList[0]['Country => City']).to.be.an(
              'Array'
            );
            expect(
              res.body?.CountryList[0]['Country => City'][0]
            ).to.have.property('City');
            expect(
              res.body?.CountryList[0]['Country => City'][0]
            ).to.have.property('CityId');

            done();
          });
      });
    });

    /**************** END : CRUD ****************/
  });
});
/**
 * @copyright Copyright (c) 2021, Xgene Cloud Ltd
 *
 * @author Naveen MR <oof1lab@gmail.com>
 * @author Pranav C Balan <pranavxc@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
