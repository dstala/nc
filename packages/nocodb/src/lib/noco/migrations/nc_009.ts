const up = async knex => {
  await knex.schema.createTable('nc_bases', table => {
    table.string('id', 128).primary();
    table.string('title');
    table.string('status');
    table.text('description');
    table.text('meta');
    table.string('color');
    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_data_src', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    // todo: foreign key
    // table.string('base_id', 128);
    // table.string('base_id', 128)
    // table.foreign('base_id').references('nc_bases.id');

    table.string('alias');
    table.string('hist');
    table.integer('port');
    table.string('username');
    table.string('password');
    table.string('database');
    table.text('url');
    table.text('params');
    table.string('token');
    table.string('type');

    // todo: type
    table.string('ssl');

    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_models_2', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    // // todo: foreign
    // table.string('base_id');
    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');
    // table.foreign('data_src_id').references('nc_data_src.id');

    table.string('title');
    table.string('alias');
    table.string('type').defaultTo('table');

    table.text('meta', 'mediumtext');
    table.text('schema', 'text');
    // table.text('schema_previous', 'text');
    table.boolean('enabled').defaultTo(true);

    // todo:
    table.string('parent_id');
    // table.string('parent_model_title');

    table.string('show_as').defaultTo('table');

    // table.text('query_params', 'mediumtext');

    // table.integer('list_idx');
    table.string('tags');
    table.boolean('pin');

    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
    table.index(['db_alias', 'title']);
  });

  await knex.schema.createTable('nc_columns', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    // table.string('base_id');
    // table.string('db_alias').defaultTo('db');
    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    // table.string('base_id', 128)
    // table.foreign('base_id').references('nc_bases.id');
    table.uuid('model_id');
    table.foreign('model_id').references('nc_models.id');

    // table.string('tn');
    // table.string('_tn');

    table.string('cn');
    table.string('_cn');

    // todo: decide type
    table.string('uidt');
    table.string('dt');
    table.string('np');
    table.string('ns');
    table.string('clen');
    table.string('cop');
    table.string('pk');
    table.string('rqd');
    table.string('un');
    table.string('ct');
    table.string('ai');
    table.string('unique');
    table.string('ctf');
    table.string('cc');
    table.string('csn');
    table.string('dtx');
    table.string('dtxp');
    table.string('dtxs');
    table.string('au');

    //todo: virtual, real, etc
    table.string('type');

    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_col_relations', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');
    table.string('db_alias').defaultTo('db');

    // table.string('base_id');
    // table.string('db_alias');
    table.string('tn');
    table.string('rtn');
    table.string('_tn');
    table.string('_rtn');
    table.string('cn');
    table.string('rcn');
    table.string('_cn');
    table.string('_rcn');

    table.string('ref_db_alias');
    table.string('type');
    table.string('db_type');

    table.uuid('column_id');
    table.foreign('column_id').references('nc_columns.id');
    table.uuid('ref_column_id');
    table.foreign('ref_column_id').references('nc_columns.id');

    table.string('ur');
    table.string('dr');

    table.string('fkn');

    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
    table.index(['db_alias', 'tn']);
  });

  await knex.schema.createTable('nc_col_lookup', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');
    table.string('db_alias').defaultTo('db');

    table.uuid('column_id');
    table.foreign('column_id').references('nc_columns.id');
    table.uuid('rel_column_id');
    table.foreign('rel_column_id').references('nc_columns.id');
    table.uuid('lookup_column_id');
    table.foreign('lookup_column_id').references('nc_columns.id');
    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
    table.index(['db_alias', 'tn']);
  });
  await knex.schema.createTable('nc_col_formula', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');
    table.string('db_alias').defaultTo('db');

    table.uuid('column_id');
    table.foreign('column_id').references('nc_columns.id');

    table.text('formula').notNullable();

    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
    table.index(['db_alias', 'tn']);
  });

  await knex.schema.createTable('nc_filter_exp', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');

    table.uuid('column_id');
    table.foreign('column_id').references('nc_columns.id');

    table.string('comparison_op');
    table.string('value');
    table.string('start');
    table.string('stop');
    table.string('op');

    table.integer('order');
    table.timestamps(true, true);
    table.index(['db_alias', 'tn']);
  });

  await knex.schema.createTable('nc_sort', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');

    table.boolean('direction').defaultTo(false);
    table.integer('order');
    table.timestamps(true, true);
    table.index(['db_alias', 'tn']);
  });

  await knex.schema.createTable('nc_shared_views_2', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('tn');

    table.text('meta', 'mediumtext');
    // todo:
    table.text('query_params', 'mediumtext');
    table.string('view_id');
    table.boolean('show_all_fields');
    table.boolean('allow_copy');
    table.string('password');

    table.boolean('deleted');
    table.integer('order');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_acl_2', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');
    table.string('role');
    table.string('permission');
    table.boolean('enabled');

    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_form_view', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('heading');
    table.string('subheading');
    table.string('success_msg');
    table.string('redirect_url');
    table.string('redirect_after_secs');
    table.string('email');
    table.boolean('submit_another_form');
    table.string('uuid');
    table.string('banner_image_url');
    table.string('public');
    table.string('password');
    table.boolean('show_all_fields');
    table.string('logo_url');

    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_form_view_columns', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    // todo: type
    table.string('uuid');
    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');
    table.string('label');
    table.string('help');
    table.boolean('required');
    table.integer('order');

    // todo : condition

    table.timestamps(true, true);
  });
  await knex.schema.createTable('nc_gallery_view', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('uuid');
    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');
    // todo:  type
    table.boolean('next_enabled');
    table.boolean('prev_enabled');
    table.integer('cover_image_idx');
    table.string('cover_image');
    table.string('restrict_types');
    table.string('restrict_size');
    table.string('restrict_number');
    table.boolean('public');
    table.string('password');
    table.boolean('show_all_fields');
    table.string('dimensions');
    table.string('responsive_columns');
    // todo : condition

    table.timestamps(true, true);
  });
  await knex.schema.createTable('nc_gallery_view_columns', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('uuid');
    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');
    // todo:  type
    table.string('label');
    table.string('help');

    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_kanban_view', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('uuid');
    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');
    // todo:  type
    table.boolean('public');
    table.string('password');
    table.boolean('show_all_fields');

    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_kanban_view_columns', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('db_alias').defaultTo('db');
    table.string('base_id', 128);
    table.foreign('base_id').references('nc_bases.id');

    table.string('uuid');
    table.string('tn');
    table.string('_tn');
    table.string('cn');
    table.string('_cn');
    // todo:  type
    table.string('label');
    table.string('help');

    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_users', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('email');
    table.string('password', 255);
    table.string('salt', 255);
    table.string('firstname');
    table.string('lastname');
    table.string('username');
    table.string('refresh_token', 255);
    table.string('invite_token', 255);
    table.string('invite_token_expires', 255);
    table.timestamp('reset_password_expires');
    table.string('reset_password_token', 255);
    table.string('email_verification_token', 255);
    table.boolean('email_verified');
    table.string('roles', 255).defaultTo('editor');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_orgs', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('title');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_teams', table => {
    table
      .uuid('id')
      .primary()
      .notNullable();

    table.string('title');
    table.uuid('org_id');
    table.foreign('org_id').references('nc_orgs.id');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('nc_team_users', table => {
    table.uuid('org_id');
    table.foreign('org_id').references('nc_orgs.id');
    table.uuid('user_id');
    table.foreign('user_id').references('nc_users.id');
    table.timestamps(true, true);
  });
  /**
   *
   *
   *
   * old tables
   */
  //
  // await knex.schema.createTable('nc_roles', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.string('type').defaultTo('CUSTOM');
  //   table.string('description');
  //   table.timestamps(true,true);
  // });
  //
  // await knex('nc_roles').insert([
  //   {
  //     db_alias: '',
  //     base_id: '',
  //     title: 'owner',
  //     description:
  //       'Can add/remove creators. And full edit database structures & fields.',
  //     type: 'SYSTEM'
  //   },
  //   {
  //     db_alias: '',
  //     base_id: '',
  //     title: 'creator',
  //     description: 'Can fully edit database structure & values',
  //     type: 'SYSTEM'
  //   },
  //   {
  //     db_alias: '',
  //     base_id: '',
  //     title: 'editor',
  //     description:
  //       'Can edit records but cannot change structure of database/fields',
  //     type: 'SYSTEM'
  //   },
  //   {
  //     db_alias: '',
  //     base_id: '',
  //     title: 'commenter',
  //     description: 'Can view and comment the records but cannot edit anything',
  //     type: 'SYSTEM'
  //   },
  //   {
  //     db_alias: '',
  //     base_id: '',
  //     title: 'viewer',
  //     description: 'Can view the records but cannot edit anything',
  //     type: 'SYSTEM'
  //   }
  //   // {
  //   //   db_alias: '',
  //   //   base_id: '',
  //   //   title: 'guest',
  //   //   description: 'API access for an unauthorized user',
  //   //   type: 'SYSTEM'
  //   // },
  // ]);
  //
  // await knex.schema.createTable('nc_hooks', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.string('description', 255);
  //   table.string('env').defaultTo('all');
  //   table.string('tn');
  //   table.string('type');
  //   table.string('event');
  //
  //   table.string('operation');
  //   table.boolean('async').defaultTo(false);
  //   table.boolean('payload').defaultTo(true);
  //
  //   table.text('url', 'text');
  //   table.text('headers', 'text');
  //
  //   table.text('condition', 'text');
  //   table.text('notification', 'text');
  //
  //   table.integer('retries').defaultTo(0);
  //   table.integer('retry_interval').defaultTo(60000);
  //   table.integer('timeout').defaultTo(60000);
  //   table.boolean('active').defaultTo(true);
  //
  //   table.timestamps();
  // });
  //
  // await knex('nc_hooks').insert({
  //   // url: 'http://localhost:4000/auth/hook',
  //   type: 'AUTH_MIDDLEWARE'
  // });
  //
  // await knex.schema.createTable('nc_store', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('key').index();
  //   table.text('value', 'text');
  //   table.string('type');
  //   table.string('env');
  //   table.string('tag');
  //   table.timestamps();
  // });
  //
  // await knex('nc_store').insert({
  //   key: 'NC_DEBUG',
  //   value: JSON.stringify({
  //     'nc:app': false,
  //     'nc:api:rest': false,
  //     'nc:api:base': false,
  //     'nc:api:gql': false,
  //     'nc:api:grpc': false,
  //     'nc:migrator': false,
  //     'nc:datamapper': false
  //   }),
  //   db_alias: ''
  // });
  //
  // await knex('nc_store').insert({
  //   key: 'NC_PROJECT_COUNT',
  //   value: '0',
  //   db_alias: ''
  // });
  //
  // await knex.schema.createTable('nc_cron', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.string('description', 255);
  //   table.string('env');
  //   table.string('pattern');
  //   table.string('webhook');
  //   table.string('timezone').defaultTo('America/Los_Angeles');
  //   table.boolean('active').defaultTo(true);
  //   table.text('cron_handler');
  //   table.text('payload');
  //   table.text('headers');
  //   table.integer('retries').defaultTo(0);
  //   table.integer('retry_interval').defaultTo(60000);
  //   table.integer('timeout').defaultTo(60000);
  //
  //   table.timestamps();
  // });
  //
  // await knex.schema.createTable('nc_routes', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.string('tn');
  //   table.string('tnp');
  //   table.string('tnc');
  //   table.string('relation_type');
  //   table.text('path', 'text');
  //   table.string('type');
  //   table.text('handler', 'text');
  //   table.text('acl', 'text');
  //   table.integer('order');
  //   table.text('functions');
  //   table.integer('handler_type').defaultTo(1);
  //   table.boolean('is_custom');
  //   // table.text('placeholder', 'longtext');
  //   table.timestamps();
  //   table.index(['db_alias', 'title', 'tn']);
  // });
  //
  // await knex.schema.createTable('nc_resolvers', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.text('resolver', 'text');
  //   table.string('type');
  //   table.text('acl', 'text');
  //   table.text('functions');
  //   table.integer('handler_type').defaultTo(1);
  //   // table.text('placeholder', 'text');
  //   table.timestamps();
  // });
  //
  // await knex.schema.createTable('nc_loaders', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.string('parent');
  //   table.string('child');
  //   table.string('relation');
  //   table.string('resolver');
  //   table.text('functions');
  //   table.timestamps();
  // });
  //
  // await knex.schema.createTable('nc_rpc', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias').defaultTo('db');
  //   table.string('title');
  //   table.string('tn');
  //   table.text('service', 'text');
  //
  //   table.string('tnp');
  //   table.string('tnc');
  //   table.string('relation_type');
  //   table.integer('order');
  //
  //   table.string('type');
  //   table.text('acl', 'text');
  //   table.text('functions', 'text');
  //   table.integer('handler_type').defaultTo(1);
  //   // table.text('placeholder', 'text');
  //   table.timestamps();
  // });
  // await knex.schema.createTable('nc_bases_users', table => {
  //   table.string('base_id').index(); // .references('id').inTable('nc_bases')
  //   // todo: foreign key
  //   table
  //     .integer('user_id')
  //     .unsigned()
  //     .index(); //.references('id').inTable('xc_users')
  //   table.text('roles');
  //   // table.text('placeholder', 'text');
  //   table.timestamps();
  // });
  //
  // await knex.schema.createTable('nc_disabled_models_for_role', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias', 45);
  //   table.string('title', 45);
  //   table.string('type', 45);
  //   table.string('role', 45);
  //   table.boolean('disabled').defaultTo(true);
  //
  //   table.string('tn');
  //   table.string('rtn');
  //   table.string('cn');
  //   table.string('rcn');
  //   table.string('relation_type');
  //   table.timestamps();
  //   table.index(
  //     ['base_id', 'db_alias', 'title', 'type', 'role'],
  //     'xc_disabled124_idx'
  //   );
  // });
  //
  // await knex.schema.createTable('nc_plugins', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias');
  //   table.string('title', 45);
  //   table.text('description');
  //   table.boolean('active').defaultTo(false);
  //   table.float('rating');
  //   table.string('version');
  //   table.string('docs');
  //   table.string('status').defaultTo('install');
  //   table.string('status_details');
  //   table.string('logo');
  //   table.string('icon');
  //   table.string('tags');
  //   table.string('category');
  //   table.text('input_schema');
  //   table.text('input');
  //   table.string('creator');
  //   table.string('creator_website');
  //   table.string('price');
  //   table.timestamps();
  // });
  //
  // await knex('nc_plugins').insert([
  //   googleAuth,
  //   ses,
  //   cache
  //   // ee,
  //   // brand,
  // ]);
  //
  // await knex.schema.createTable('nc_audit', table => {
  //   table.increments();
  //   table.string('user');
  //   table.string('ip');
  //   table.string('base_id');
  //   table.string('db_alias');
  //   table.string('model_name', 100);
  //   table.string('model_id', 100);
  //   /* op_type - AUTH, DATA, SQL, META */
  //   table.string('op_type');
  //   table.string('op_sub_type');
  //   table.string('status');
  //   table.text('description');
  //   table.text('details');
  //   table.index(
  //     ['db_alias', 'base_id', 'model_name', 'model_id'],
  //     '`nc_audit_index`'
  //   );
  //
  //   table.timestamps();
  // });
  //
  // await knex.schema.createTable('nc_migrations', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias');
  //   table.text('up');
  //   table.text('down');
  //
  //   table.string('title').notNullable();
  //   table.string('title_down').nullable();
  //   table.string('description').nullable();
  //   table.integer('batch').nullable();
  //   table.string('checksum').nullable();
  //   table.integer('status').nullable();
  //
  //   table.timestamps();
  // });
  //
  // await knex.schema.createTable('nc_api_tokens', table => {
  //   table.increments();
  //   table.string('base_id');
  //   table.string('db_alias');
  //   table.string('description');
  //   table.text('permissions');
  //   table.text('token');
  //   table.string('expiry');
  //   table.boolean('enabled').defaultTo(true);
  //   table.timestamps();
  // });
};

const down = async knex => {
  await knex.schema.dropTable('nc_bases');
  await knex.schema.dropTable('nc_data_src');
  await knex.schema.dropTable('nc_models');
  await knex.schema.dropTable('nc_columns');
  await knex.schema.dropTable('nc_relations');
  await knex.schema.dropTable('nc_filter_exp');
  await knex.schema.dropTable('nc_sort');
  await knex.schema.dropTable('nc_shared_views');
  await knex.schema.dropTable('nc_acl');
  await knex.schema.dropTable('nc_form_view');
  await knex.schema.dropTable('nc_form_view_columns');
  await knex.schema.dropTable('nc_gallery_view');
  await knex.schema.dropTable('nc_gallery_view_columns');
  await knex.schema.dropTable('nc_kanban_view');
  await knex.schema.dropTable('nc_kanban_view_columns');

  await knex.schema.dropTable('nc_col_relations');
  await knex.schema.dropTable('nc_col_lookup');
  await knex.schema.dropTable('nc_col_formula');

  // await knex.schema.dropTable('nc_plugins');
  // await knex.schema.dropTable('nc_disabled_models_for_role');
  // await knex.schema.dropTable('nc_shared_views');
  // await knex.schema.dropTable('nc_bases_users');
  // await knex.schema.dropTable('nc_bases');
  // await knex.schema.dropTable('nc_roles');
  // await knex.schema.dropTable('nc_hooks');
  // await knex.schema.dropTable('nc_store');
  // await knex.schema.dropTable('nc_cron');
  // await knex.schema.dropTable('nc_acl');
  // await knex.schema.dropTable('nc_models');
  // await knex.schema.dropTable('nc_relations');
  // await knex.schema.dropTable('nc_routes');
  // await knex.schema.dropTable('nc_resolvers');
  // await knex.schema.dropTable('nc_loaders');
  // await knex.schema.dropTable('nc_rpc');
  // await knex.schema.dropTable('nc_audit');
  // await knex.schema.dropTable('nc_migrations');
  // await knex.schema.dropTable('nc_api_tokens');
};

export { up, down };
