const country = require('./models/country')
const city = require('./models/city')
const address = require('./models/address')
const film = require('./models/film')
const actor = require('./models/actor')
const film_actor = require('./models/film_actor')
const category = require('./models/category')
const film_category = require('./models/film_category')
const language = require('./models/language')

module.exports = {
  country,
  city,
  address,
  film,
  actor,
  film_actor,
  language,
  category,
  film_category
}