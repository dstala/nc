module.exports =  [
  {
    id: '53c0b009-f211-4d8d-b617-631be69c4a9c',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: 'fa64e541-4685-42dd-a4eb-b08162880fcf',
    cn: 'category_id',
    _cn: 'CategoryId',
    uidt: 'Number',
    dt: 'tinyint',
    np: '3',
    ns: '0',
    cop: '1',
    pk: '1',
    rqd: '1',
    un: '1',
    ct: 'tinyint unsigned',
    ai: '1',
    unique: '0',
    cc: '',
    dtx: 'specificType',
    dtxp: '',
    dtxs: '0',
    au: '0',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    title: 'category'
  },
  {
    id: '0c1bb060-fb00-4c44-bf40-51b3b7f0a75e',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: 'fa64e541-4685-42dd-a4eb-b08162880fcf',
    cn: 'name',
    _cn: 'Name',
    uidt: 'SingleLineText',
    dt: 'varchar',
    clen: '25',
    cop: '2',
    pk: '0',
    rqd: '1',
    un: '0',
    ct: 'varchar(25)',
    ai: '0',
    unique: '0',
    cc: '',
    csn: 'utf8mb4',
    dtx: 'specificType',
    dtxp: '25',
    au: '0',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    title: 'category'
  },
  {
    id: '1da9dc5f-99fd-4d58-897e-dabcd0360218',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: 'fa64e541-4685-42dd-a4eb-b08162880fcf',
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
    title: 'category'
  },
  {
    id: '4635def3-3d23-44ac-b398-04928a7508f9',
    db_alias: 'db',
    base_id: 'endless_pony_f_u0',
    model_id: 'fa64e541-4685-42dd-a4eb-b08162880fcf',
    _cn: 'Category => FilmCategory',
    uidt: 'LinkToAnotherRecord',
    type: 'hm',
    created_at: '2021-12-01 12:57:52',
    updated_at: '2021-12-01 12:57:52',
    rel_cn: 'category_id',
    ref_rel_cn: 'category_id',
    rel_tn: 'film_category',
    ref_rel_tn: 'film_category',
    rel_id: 'd5c98e7c-b549-4ba6-9568-c885262fc79f',
    title: 'category'
  }
]