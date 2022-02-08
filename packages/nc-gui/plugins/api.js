import { Api } from 'nc-common'

export default function({ store: $store, $axios, ...rest }, inject) {
  inject('api', new Api({
    baseURL: 'http://localhost:8080'
  }))
}
