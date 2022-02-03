import { expect } from 'chai';
import 'mocha';
import express from 'express';
import request from 'supertest';

import { Noco } from '../lib';
import NcConfigFactory from '../lib/utils/NcConfigFactory';
import { ProjectBody } from '../lib/noco-models/Project';
import { Api } from '../lib/noco-client/Api';

const knex = require('knex');

process.env.NODE_ENV = 'test';
process.env.TEST = 'test';
const dbName = `test_meta`;
process.env[`DATABASE_URL`] = `mysql2://root:password@localhost:3306/${dbName}`;
// process.env[`DATABASE_URL`] = `pg://postgres:password@localhost:5432/${dbName}`;
// process.env[
//   `DATABASE_URL`
// ] = `mssql://sa:Password123.@localhost:1433/${dbName}`;

let projectId;
let token;
const dbConfig = NcConfigFactory.urlToDbConfig(
  NcConfigFactory.extractXcUrlFromJdbc(
    // 'sqlite:////Users/pranavc/xgene/nc/packages/nocodb/tests/sqlite-dump/sakila.db')
    process.env[`DATABASE_URL`]
  )
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
describe('Noco v2 Tests', function() {
  let app;
  const api = new Api({
    baseURL: 'http://localhost:8080'
  });

  // Called once before any of the tests in this block begin.
  before(function(done) {
    this.timeout(200000);

    (async () => {
      try {
        await knex(dbConfig).raw(`DROP DATABASE ${dbName}`);
        await knex(dbConfig).raw(`DROP DATABASE test_db_12345`);
      } catch {}

      const server = express();

      server.use(await Noco.init());
      server.listen('8080');
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
    process.exit();
  });

  describe('Meta API Tests', function() {
    this.timeout(10000);
    const EMAIL_ID = 'abc@g.com';
    const VALID_PASSWORD = '1234566778';

    before(function(done) {
      this.timeout(120000);
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
    });

    it('Project create & table create - v2', async function() {
      this.timeout(120000);
      // const projectBody: ProjectBody = {
      //   title: 'restv2',
      //   bases: [{ ...dbConfig, alias: 'db' }]
      // };

      const projectRes = await api.meta.projectCreate({
        title: 'test',
        bases: [
          {
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'password',
            database: 'test_db_12345'
          }
        ]
      });

      const tableRes = await api.meta.tableCreate(
        projectRes.data.id,
        projectRes.data.bases[0].id,
        {
          tn: 'abc',
          _tn: 'Abc',
          columns: [
            {
              cn: 'id',
              dt: 'int',
              dtx: 'integer',
              ct: 'int(11)',
              nrqd: false,
              rqd: true,
              ck: false,
              pk: true,
              un: false,
              ai: true,
              cdf: null,
              clen: null,
              np: null,
              ns: 0,
              dtxp: '',
              dtxs: '',
              altered: 1,
              uidt: 'ID',
              uip: '',
              uicn: ''
            },
            {
              cn: 'title',
              dt: 'varchar',
              dtx: 'specificType',
              ct: 'varchar(45)',
              nrqd: true,
              rqd: false,
              ck: false,
              pk: false,
              un: false,
              ai: false,
              cdf: null,
              clen: 45,
              np: null,
              ns: null,
              dtxp: '45',
              dtxs: '',
              altered: 1,
              uidt: 'SingleLineText',
              uip: '',
              uicn: ''
            }
          ]
        }
      );

      console.log(projectRes.data, tableRes.data);

      const data = await api.data.list(
        projectRes.data.id,
        tableRes.data.id,
        tableRes.data.id
      );
      console.log(data.data);
      // const data = await request(app)
      //   .get(`/nc/${projectId}/api/v2/abc`)
      //   .set('xc-auth', token)
      //   .expect(200);
      // console.log(data);
      // , (err, res) => {
      //   if (err) done(err);
      //   expect(res.body?.AddressLisat?.[0]?.['cityName']).to.be.a(
      //     'String'
      //   );
      //
      //   done();
      // });
    });

    it('Tables list', function(done) {
      request(app)
        .get(`/projects/${projectId}/tables/`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          expect(res.body).to.have.all.keys(
            'page',
            'count',
            'size',
            'content',
            'firstPage',
            'lastPage'
          );
          expect(res.body.size).to.be.a('Number');
          expect(res.body.count).to.be.a('Number');
          expect(res.body.page).to.be.a('Number');
          expect(res.body.firstPage).to.be.a('Boolean');
          expect(res.body.lastPage).to.be.a('Boolean');
          expect(res.body.content).to.be.a('Array');
          done();
        });
    });
    it('Project create', function(done) {
      const projectBody: ProjectBody = {
        title: 'restv2',
        bases: [{ ...dbConfig, alias: 'db' }]
      };

      request(app)
        .post(`/projects`)
        .send(projectBody)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          expect(res.body).to.have.all.keys(
            'page',
            'count',
            'size',
            'content',
            'firstPage',
            'lastPage'
          );
          expect(res.body.size).to.be.a('Number');
          expect(res.body.count).to.be.a('Number');
          expect(res.body.page).to.be.a('Number');
          expect(res.body.firstPage).to.be.a('Boolean');
          expect(res.body.lastPage).to.be.a('Boolean');
          expect(res.body.content).to.be.a('Array');
          done();
        });
    });

    it('Project list', function(done) {
      request(app)
        .get(`/projects`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          expect(res.body).to.have.all.keys(
            'page',
            'count',
            'size',
            'content',
            'firstPage',
            'lastPage'
          );
          expect(res.body.size).to.be.a('Number');
          expect(res.body.count).to.be.a('Number');
          expect(res.body.page).to.be.a('Number');
          expect(res.body.firstPage).to.be.a('Boolean');
          expect(res.body.lastPage).to.be.a('Boolean');
          expect(res.body.content).to.be.a('Array');
          done();
        });
    });

    it('New Table', function(done) {
      request(app)
        .get(`/projects/${projectId}/tables/`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          expect(res.body).to.have.all.keys(
            'page',
            'count',
            'size',
            'content',
            'firstPage',
            'lastPage'
          );
          expect(res.body.size).to.be.a('Number');
          expect(res.body.count).to.be.a('Number');
          expect(res.body.page).to.be.a('Number');
          expect(res.body.firstPage).to.be.a('Boolean');
          expect(res.body.lastPage).to.be.a('Boolean');
          expect(res.body.content).to.be.an('Array');
          done();
        });
    });

    it('Get Table', function(done) {
      request(app)
        .get(`/projects/${projectId}/tables/`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          request(app)
            .get(`/projects/${projectId}/tables/${res.body.tables.list[0].id}`)
            .set('xc-auth', token)
            .expect(200, (err, res1) => {
              if (err) return done(err);
              expect(res1.body).to.be.a('Object');
              expect(res1.body.sorts).to.be.an('Array');
              expect(res1.body.columns).to.be.a('Array');
              expect(res1.body.columnsById).to.be.an('Object');
              done();
            });
        });
    });

    it('Get Table - sdk', function(done) {
      request(app)
        .get(`/projects/${projectId}/tables/`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          api.meta
            .tableRead(projectId, '1', res.body.tables.list[0].id)
            .then(res => {
              console.log(res);
            })
            .catch(e => done(e));
          // request(app)
          //   .get(`/projects/${projectId}/tables/${res.body.tables.list[0].id}`)
          //   .set('xc-auth', token)
          //   .expect(200, (err, res1) => {
          //     if (err) return done(err);
          //     expect(res1.body).to.be.a('Object');
          //     expect(res1.body.sorts).to.be.an('Array');
          //     expect(res1.body.columns).to.be.a('Array');
          //     expect(res1.body.columnsById).to.be.an('Object');
          //     done();
          //   });
        });
    });

    it('Delete Table', function(done) {
      request(app)
        .get(`/projects/${projectId}/tables/`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          request(app)
            .get(`/projects/${projectId}/tables/${res.body.content[0].id}`)
            .set('xc-auth', token)
            .expect(200, (err, res1) => {
              if (err) return done(err);
              expect(res1.body).to.be.a('Object');
              done();
            });
        });
    });
    it('Update Table', function(done) {
      request(app)
        .get(`/projects/${projectId}/tables/`)
        .set('xc-auth', token)
        .expect(200, (err, res) => {
          if (err) return done(err);

          request(app)
            .get(`/projects/${projectId}/tables/${res.body.content[0].id}`)
            .set('xc-auth', token)
            .expect(200, (err, res1) => {
              if (err) return done(err);
              expect(res1.body).to.be.a('Object');
              done();
            });
        });
    });
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
