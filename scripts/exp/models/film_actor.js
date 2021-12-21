module.exports =  [{
  id: '55f568dd-ddfc-4e34-b580-8ee252a8f1d2',
  db_alias: 'db',
  base_id: 'endless_pony_f_u0',
  model_id: '16e57ddc-b6f3-49d2-9e1e-bd73d12d328c',
  cn: 'actor_id',
  _cn: 'ActorId',
  uidt: 'Number',
  dt: 'smallint',
  np: '5',
  ns: '0',
  cop: '1',
  pk: '1',
  rqd: '1',
  un: '1',
  ct: 'smallint unsigned',
  ai: '0',
  unique: '0',
  cc: '',
  dtx: 'specificType',
  dtxp: '5',
  dtxs: '0',
  au: '0',
  created_at: '2021-12-01 12:57:52',
  updated_at: '2021-12-01 12:57:52',
  title: 'film_actor'
},
  {
    id: '5b17da10-dcdc-42f0-a959-ad19aae62544',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: '16e57ddc-b6f3-49d2-9e1e-bd73d12d328c',
    cn: 'film_id',
    _cn: 'FilmId',
    uidt: 'Number',
    dt: 'smallint',
    np: '5',
    ns: '0',
    cop: '2',
    pk: '1',
    rqd: '1',
    un: '1',
    ct: 'smallint unsigned',
    ai: '0',
    unique: '0',
    cc: '',
    dtx: 'specificType',
    dtxp: '5',
    dtxs: '0',
    au: '0',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    title: 'film_actor'
  },
  {
    id: 'bbdf30de-9068-4099-b01b-a5b76dd6fc17',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: '16e57ddc-b6f3-49d2-9e1e-bd73d12d328c',
    cn: 'last_update',
    _cn: 'LastUpdate',
    uidt: 'DateTime',
    dt: 'timestamp',
    cop: '3',
    pk: '0',
    rqd: '1',
    un: '0',
    ct: 'timestamp',
    ai: '0',
    unique: '0',
    cc: '',
    dtx: 'specificType',
    dtxp: '0',
    au: '0',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    title: 'film_actor'
  },
  {
    id: 'd16096db-caaf-45c0-a3b5-b303dd974df9',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: '16e57ddc-b6f3-49d2-9e1e-bd73d12d328c',
    _cn: 'Actor <= FilmActor',
    uidt: 'LinkToAnotherRecord',
    type: 'bt',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    rel_cn: 'actor_id',
    ref_rel_cn: 'actor_id',
    rel_tn: 'film_actor',
    ref_rel_tn: 'film_actor',
    rel_id: '76fb749a-ddb4-4fdd-be45-a250bad856dc',
    title: 'film_actor'
  },
  {
    id: '263d84b5-e124-47b0-a17c-75d2df6379da',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: '16e57ddc-b6f3-49d2-9e1e-bd73d12d328c',
    _cn: 'Film <= FilmActor',
    uidt: 'LinkToAnotherRecord',
    type: 'bt',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    rel_cn: 'film_id',
    ref_rel_cn: 'film_id',
    rel_tn: 'film_actor',
    ref_rel_tn: 'film_actor',
    rel_id: '706c6b87-3604-4e1d-9033-2448801f7fcd',
    title: 'film_actor'
  },
]