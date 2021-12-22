const delay = t => new Promise(res => setTimeout(() => res(), t))

const time = 1000;
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    user: 'root',
    password: 'password',
    database: 'sakila'
  }
});


class Country {
  constructor(data) {
    Object.assign(this, data)
  }

  async cityList() {
    return (await knex('city').select('*').where({
      country_id: this.country_id
    })).map(c => new City(c))
  }

  async cityCount() {
    return (await knex('city').count('city_id as count').where({
      country_id: this.country_id
    }).first()).count
  }

  async addressCount() {

    return await Promise.all((await this.cityList()).map(c => c.addressCount()))

    // return (await knex('city').count('city_id as count').where({
    //   country_id: this.country_id
    // }).first()).count
  }
  async addressList() {

    return await Promise.all((await this.cityList()).map(c => c.addressList()))

    // return (await knex('city').count('city_id as count').where({
    //   country_id: this.country_id
    // }).first()).count
  }
}


class Address {
  constructor(data) {
    Object.assign(this, data)
  }
}

class City {
  constructor(data) {
    Object.assign(this, data)
  }

  async countryRead() {
    return new Country((await knex('country').select('*').where({
      country_id: this.country_id
    }).first()))
  }

  async addressList() {
    return (await knex('address').select('*').where({
      city_id: this.city_id
    })).map(c => new Address(c))
  }

  async addressCount() {
    return (await knex('address').count('city_id as count').where({
      city_id: this.city_id
    }).first()).count
  }


}


// const nestResolver = {
//   country: `INDIA`,
//   async cityCount() {
//     await delay(time)
//     return `12-${time}`
//   },
//   async cityList() {
//     await delay(time)
//     return {
//       city: `city 1-${time}`,
//       async addressCount() {
//         await delay(time)
//         return `2-${time}`
//       },
//     }
//   }
// };


const ast = [{
  name: 'Country',
  type: 'Object',
  fields: [{
    name: 'country_id',
    type: 'number'
  }, {
    name: 'country',
    type: 'string'
  }, {
    name: 'cityList',
    type: 'array',
    elementType: 'City'
  }, {
    name: 'cityCount',
    type: 'number'
  }]
}, {
  name: 'City',
  type: 'Object',
  fields: [{
    name: 'city_id',
    type: 'number'
  }, {
    name: 'country_id',
    type: 'number'
  }, {
    name: 'city',
    type: 'string'
  }, {
    name: 'addressList',
    type: 'array',
    elementType: 'City'
  }, {
    name: 'countryRead',
    type: 'Country'
  }, {
    name: 'addressCount',
    type: 'number'
  }]
}, {
  name: 'Address',
  type: 'Object',
  fields: [{
    name: 'address',
    type: 'string'
  }]
}]


const nestResolver = {
  async Country() {
    return new Country(await knex('country').first())
  },

  async CountryList() {
    return (await knex('country').limit(10)).map(c => new Country(c))
  }
}


const req = {
  CountryList: {
    country: 1,
    addressCount:1,
    addressList:1
  },
}


const reqExecutor = async (reqObj, resObj, res = {}, prefix = '') => {
  await Promise.all(Object.keys(reqObj).map(async (key) => {
    if (key in resObj) {
      if (typeof resObj[key] === 'function') {
        res[key] = await resObj[key]()//.call(res);
        // console.log(prefix + res[key])
      } else if (typeof resObj[key] === 'object') {
        res[key] = resObj[key]
        // console.log(prefix + res[key])
      } else {
        res[key] = resObj[key]
        // console.log(prefix + res[key])
      }
      await delay(100)
    }
    if (reqObj[key] && typeof reqObj[key] === 'object') {
      if (Array.isArray(res[key])) {
        res[key] = await Promise.all(res[key].map(r => reqExecutor(reqObj[key], r, {}, prefix + '\t')))
      } else {
        res[key] = await reqExecutor(reqObj[key], res[key], {}, prefix + '\t')
      }
    }

  }))

  return res
}

(async () => {
  console.time('start')
  console.log(JSON.stringify(await reqExecutor(req, nestResolver), 0, 2));
  console.timeEnd('start')
})().catch(e => console.log(e)).finally(() => process.exit(0))
