const path = require('path')
const _ = require('lodash');
// const fs = require('fs')
const knex1 = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, "../noco.db")
    // filename: path.join(__dirname, "./test.db")
  }
});
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    database: 'sakila',
    user: 'root',
    password: 'password',
  }
});

const columnsObj = require('./columns');
const UITypes = require("../build/main/lib/sqlUi/UITypes");


// knex('nc_columns as col')
//   .leftJoin('nc_col_relations as rel', 'col.id','rel.column_id')
//   // .where('tab.title', 'country')
//   .then(r=>{
//   console.log(r)
// })
//

/*
knex('nc_models_2 as tab')
  .select('col.id','col.cn','col._cn','col.uidt', 'rel.rel_cn','rel.ref_rel_cn', 'rel.id as rel_id')
  .join('nc_columns as col','tab.id','col.model_id')
  .leftJoin(
    knex('nc_col_relations as r')
      .select('r.*','col1.cn as rel_cn', 'col1._cn as _rel_cn', 'col2.cn as ref_rel_cn', 'col2._cn as _ref_rel_cn' )
      .join('nc_columns as col1', 'col1.id','r.rel_column_id')
      .join('nc_columns as col2', 'col2.id','r.ref_rel_column_id'). as ('rel')
    , 'col.id','rel.column_id')
  .where('tab.title', 'country')
  .then(r=>{
  console.log(r)
})
*/


(async () => {

// const res =   await knex1('nc_models_2 as tab')
//     .select('tab.id')
//     .join('nc_columns as col','tab.id','col.model_id')
//     .where('title','country')
//     console.log(res)

  /*        const r = await knex1('nc_models_2 as tab')
             .select('col.*',
               'col.id',
               'col.cn',
               'col._cn',
               'col.uidt',
               'rel.rel_cn',
               'rel.ref_rel_cn',
               'rel.rel_tn',
               'rel.ref_rel_tn',
               'rel.id as rel_id',
               'rel.type',
               'lk.lcn',
               'lk._lcn',
               'tab.title'
             )
             .join('nc_columns as col','tab.id','col.model_id')
             .leftJoin(
               knex('nc_col_relations as r')
                 .select('r.*','col1.cn as rel_cn', 'col1._cn as _rel_cn', 'col2.cn as ref_rel_cn', 'col2._cn as _ref_rel_cn',
                   'tab1.title as rel_tn', 'tab1.alias as _rel_tn', 'tab2.title as ref_rel_tn', 'tab2.alias as _ref_rel_tn'
                   )
                 .join('nc_columns as col1', 'col1.id','r.rel_column_id')
                 .join('nc_models_2 as tab1', 'tab1.id','col1.model_id')
                 .join('nc_columns as col2', 'col2.id','r.ref_rel_column_id')
                 .join('nc_models_2 as tab2', 'tab2.id','col2.model_id'). as ('rel')
               , 'col.id','rel.column_id')
             .leftJoin(
               knex('nc_col_lookup as l')
                 .select('l.column_id','col1.cn as lcn', 'col1._cn as _lcn','l.id as lk_id'  )
                 .join('nc_columns as col1', 'col1.id','l.lookup_column_id').as('lk')
               , 'col.id','lk.column_id')
             .whereIn('tab.title', ['language']).orderBy(
              'tab.title');

        console.log(r)*/
  //
  // fs.writeFileSync(path.join(__dirname,'./columns.json'), JSON.stringify(r,0,2))

//
// knex('nc_columns').insert({
//
// }).then(r =>{
//
// })


// Country => City => Address <= Person

// country =====> Address
// country =====> Person

  /*

    await knex.schema.createTable('country',table =>{
      table.increments('id')
      table.string('name')
    })
    await knex.schema.createTable('city',table =>{
      table.increments('id')
      table.string('name')
      table.integer('country_id').unsigned()
      table.foreign('country_id').references('country.id')
    })
    await knex.schema.createTable('address',table =>{
      table.increments('id')
      table.string('name')
      table.integer('city_id').unsigned()
      table.foreign('city_id').references('city.id')
      table.integer('person_id').unsigned()
      table.foreign('person_id').references('person.id')
    })
    await knex.schema.createTable('person',table =>{
      table.increments('id')
      table.string('name')
    })

    await knex('country').insert({
      id:1,
      name:'India'
    })
    await knex('city').insert({
      id:1,
      country_id:1,
      name:'Bangalore'
    })
    await knex('city').insert({
      id:2,
      country_id:1,
      name:'Chennai'
    })

    await knex('person').insert({
      id:1,
      name:'John'
    })
    await knex('person').insert({
      id:2,
      name:'Ram'
    })

    await knex('address').insert({
      id:1,
      name:'Blr_addr',
      city_id:1,
      person_id:1,
    })
    await knex('address').insert({
      id:2,
      name:'Blr_addr2',
      city_id:1,
      person_id:2,
    })
    await knex('address').insert({
      id:3,
      name:'Chn_addr',
      city_id:2,
      person_id:2,
    })
  */


// Country => City => Address <= Person

// country =====> Address
// country =====> Person

  //
  // const country = await knex('country').select()
  //
  // console.log(country)
  //
  //
  // const address = await knex('address').select('address.*').innerJoin('city', 'city.id', 'address.city_id').where('city.country_id', 1)
  //
  // console.log(address)
  //
  // // const person = await knex('person')
  // //   // .distinct('person.id')
  // //   .select('person.*')
  // //   .innerJoin('address', 'address.person_id', 'person.id')
  // //   .innerJoin('city', 'city.id', 'address.city_id')
  // //   .where('city.country_id', 1)
  // //
  // // console.log(person)
  //
  // const person1 = await knex('person')
  //   // .distinct('person.id')
  //   .select('person.*')
  //   .whereIn('person.id',
  //     knex('address').select('address.person_id').innerJoin('city', 'city.id', 'address.city_id').where('city.country_id', 1)
  //   )
  // // .innerJoin('address', 'address.person_id', 'person.id')
  // // .innerJoin('city', 'city.id', 'address.city_id')
  // // .where('city.country_id', 1)
  //
  // console.log(person1)
  //
  // // console.log(knex('person')
  // //   // .distinct('person.id')
  // //   .select('person.*')
  // //   .whereIn('person.id',
  // //     knex('address').select('address.person_id').innerJoin('city', 'city.id', 'address.city_id').where('city.country_id', 1)
  // //   ).toQuery())


  console.time('actor')

  const qb = knex('actor');

  for (const col of columnsObj.actor) {
    switch (col.uidt) {

      case 'LinkToAnotherRecord':
      case 'Lookup':
      case 'Formula':
        break
      default:
        qb.select(knex.raw(`?? as ??`, [col.cn, col._cn]))
        break;
    }
  }


  const data = await qb.limit(10);

  const pk = columnsObj.actor.find(c => c.pk)
  const ids = data.map(r => r[pk._cn])


  for (const col of columnsObj.actor) {


    switch (col.uidt) {


      case 'LinkToAnotherRecord':


        if (col.type === 'hm') {
          const children = await knex.union(ids.map(id => {

              const query = knex(col.rel_tn)
                .where(col.rel_cn, id)
                .limit(10)
              return query
            }), true
          )

          const gb = children.reduce((gb, r) => {
            gb[r[col.rel_cn]] = gb[r[col.rel_cn]] || []
            gb[r[col.rel_cn]].push(r)
            return gb
          }, {})

          for (const d of data) {
            d[col._cn] = gb[d[pk._cn]]
          }
        }
        if (col.type === 'bt') {

          const parentIds = data.map(r => r[col._rel_cn]).filter(id => id !== null && id !== undefined)

          const parents = await knex(col.rel_tn)
            .whereIn(col.rel_cn, parentIds)
          // .limit(10)

          const gb = parents.reduce((gb, r) => {
            gb[r[col.ref_rel_cn]] = r
            return gb
          }, {})

          for (const d of data) {
            d[col._cn] = gb[d[col._rel_cn]]
          }
        }

        if (col.type === 'mm') {

          const key = `${col.title}_${col.v_rel_cn}`;

          const childs = await knex.union(
            ids.map(id => {
              const query = knex(col.ref_rel_tn)
                .join(col.v_rel_tn, `${col.v_rel_tn}.${col.v_ref_rel_cn}`, `${col.ref_rel_tn}.${col.ref_rel_cn}`)
                .where(`${col.v_rel_tn}.${col.v_rel_cn}`, id) // p[this.columnToAlias?.[this.pks[0].cn] || this.pks[0].cn])
                // .xwhere(where, this.dbModels[child].selectQuery(''))
                .select({
                  [key]: `${col.v_rel_tn}.${col.v_rel_cn}`,
                }).select(`${col.ref_rel_tn}.*`);

              // return this.isSqlite() ? driver.select().from(query) :
              return query;
            }),
            true
          );

          const gs = _.groupBy(childs, key);


          for (const d of data) {
            d[col._cn] = gs[d[pk._cn]]
          }
        }
        break;

      // todo: combine with LinkToAnotherRecord
      case 'Lookup': {

        let lkPk, prev, isArr = col.type !== 'bt';
        let field, lkQb
        prev = col;
        if (col.type === 'hm') {
          // todo: decide based on type
          field = columnsObj[col.rel_tn].find(c => c.id === col.lookup_column_id)

          lkQb = knex(col.ref_rel_tn).join(col.rel_tn,
            `${col.rel_tn}.${col.rel_cn}`,
            `${col.ref_rel_tn}.${col.ref_rel_cn}`
          )


          lkPk = columnsObj[col.rel_tn]?.find(c => c.pk) || lkPk

        } else if (col.type === 'bt') {
          // todo: decide based on type
          field = columnsObj[col.ref_rel_tn].find(c => c.id === col.lookup_column_id)

          lkQb = knex(col.rel_tn).join(col.ref_rel_tn,
            `${col.ref_rel_tn}.${col.ref_rel_cn}`,
            `${col.rel_tn}.${col.rel_cn}`
          )


          lkPk = columnsObj[col.ref_rel_tn]?.find(c => c.pk) || lkPk

        } else if (col.type === 'mm') {
          // throw new Error('"m2m" lookup not implemented')


          // todo: decide based on type
          field = columnsObj[col.ref_rel_tn].find(c => c.id === col.lookup_column_id)

          lkQb = knex(col.rel_tn).join(col.v_rel_tn,
            `${col.v_rel_tn}.${col.v_rel_cn}`,
            `${col.rel_tn}.${col.rel_cn}`
          ).join(col.ref_rel_tn,
            `${col.v_rel_tn}.${col.v_ref_rel_cn}`,
            `${col.ref_rel_tn}.${col.ref_rel_cn}`
          )


          lkPk = columnsObj[col.ref_rel_tn]?.find(c => c.pk) || lkPk
        }

        while (field?.uidt === 'Lookup') {
          isArr = isArr || col.type !== 'bt';
          prev = field;

          if (field.type === 'hm') {
            lkQb.join(field.rel_tn,
              `${field.rel_tn}.${field.rel_cn}`,
              `${field.ref_rel_tn}.${field.ref_rel_cn}`
            )
            lkPk = columnsObj[field.rel_tn]?.find(c => c.pk) || lkPk
            field = columnsObj[field.rel_tn].find(c => c.id === field.lookup_column_id)
          } else if (field.type === 'bt') {
            lkQb.join(field.ref_rel_tn,
              `${field.ref_rel_tn}.${field.ref_rel_cn}`,
              `${field.rel_tn}.${field.rel_cn}`
            )
            lkPk = columnsObj[field.ref_rel_tn]?.find(c => c.pk) || lkPk
            field = columnsObj[field.ref_rel_tn].find(c => c.id === field.lookup_column_id)
          } else if (field.type === 'mm') {
            throw new Error('nested "m2m" lookup not implemented')
          }
        }


        // console.log(lkQb.toQuery())


        // check the look up column type
        //    if it's lookup
        //        construct query recursively
        //     else construct query


        const children = await knex.union(ids.map(id => {
            // lkQb.select(`${field.title}.${field.cn} as ${field._cn}`)

            let query;
            if (prev.type === 'hm') {
              query = knex(`${field.title} as a`)
                .select(`a.${field.cn} as ${field._cn}`, knex.raw('? as ??', [id, pk.cn]))
                .whereIn(
                  lkPk.cn,
                  lkQb.clone().select(`${lkPk.title}.${lkPk.cn}`).where(`${col.ref_rel_tn}.${pk.cn}`, id)
                )
                .limit(10)
            } else if (prev.type === 'bt') {
              query = knex(`${field.title} as a`)
                .select(`a.${field.cn} as ${field._cn}`, knex.raw('? as ??', [id, pk.cn]))
                .whereIn(
                  prev.ref_rel_cn,
                  lkQb.clone().select(`${prev.rel_tn}.${prev.rel_cn}`).where(`${pk.title}.${pk.cn}`, id)
                )
                .limit(10)
            } else if (prev.type === 'mm') {
              // throw new Error('"m2m" lookup not implemented')

              query = knex(`${field.title} as a`)
                .select(`a.${field.cn} as ${field._cn}`, knex.raw('? as ??', [id, pk.cn]))
                .whereIn(
                  prev.ref_rel_cn,
                  lkQb.clone().select(`${prev.v_rel_tn}.${prev.v_ref_rel_cn}`).where(`${col.rel_tn}.${pk.cn}`, id)
                )
                .limit(10)
            }


            console.log(query.toQuery())

            return query
          }), true
        )

        const gb = children.reduce((gb, r) => {
          if (prev.type === 'hm') {
            gb[r[col.rel_cn]] = gb[r[col.rel_cn]] || []
            gb[r[col.rel_cn]].push(r[field._cn])
          } else if (prev.type === 'bt') {
            gb[r[pk.cn]] = gb[r[pk.cn]] || []
            gb[r[pk.cn]].push(r[field._cn])
          } else if (prev.type === 'mm') {
            // throw new Error('"m2m" lookup not implemented')
            gb[r[pk.cn]] = gb[r[pk.cn]] || []
            gb[r[pk.cn]].push(r[field._cn])
          }
          return gb
        }, {})

        for (const d of data) {
          d[col._cn] = isArr ? gb[d[pk._cn]] : gb[d[pk._cn]] && gb[d[pk._cn]][0]
        }
      }
        break;
      case UITypes.Formula:
        break
      default:
        break;
    }
  }

  console.log(data)
  console.timeEnd('actor')


})();


/*
*
* SELECT
   distinct(c.country_id)  -- c.*, c1.*, a.*
FROM
    country  c
        left JOIN
    city c1 ON c1.country_id = c.country_id
        left JOIN
     address a ON c1.city_id = a.city_id

     where c.country LIKE '%a' OR (c1.city like '%a%' AND a.address like '%a%');



SELECT
    distinct(country_id)
FROM
    country
WHERE
    country LIKE '%a'
        OR ((country_id IN (SELECT
            city.country_id
        FROM
            city
        WHERE
            city.city LIKE '%a%'))
        AND country_id IN (SELECT
            city.country_id
        FROM
            city
                JOIN
            address ON city.city_id = address.city_id
        WHERE
            address.address LIKE '%a%'))

* */


// city => address


// country => city => address
