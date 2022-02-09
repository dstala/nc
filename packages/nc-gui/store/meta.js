export const state = () => ({
  metas: {},
  loading: {}
})

export const mutations = {
  MutMeta(state, { key, value }) {
    state.metas = { ...state.metas, [key]: value }
  },
  MutLoading(state, { key, value }) {
    state.loading = { ...state.loading, [key]: value }
  },
  MutClear(state) {
    state.metas = {}
  }
}

export const actions = {
  async ActLoadMeta({ state, commit, dispatch, rootState }, {
    tn,
    env = '_noco',
    dbAlias = 'db',
    force,
    // eslint-disable-next-line camelcase
    project_id,
    id
  }) {
    if (!force && state.loading[tn || id]) {
      return await new Promise((resolve) => {
        const unsubscribe = this.app.store.subscribe((s) => {
          if (s.type === 'meta/MutLoading' && s.payload.key === (id || tn) && !s.payload.value) {
            unsubscribe()
            resolve(state.metas[tn || id])
          }
        })
      })
    }
    if (!force && state.metas[tn]) {
      return state.metas[tn]
    }
    if (!force && state.metas[id]) {
      return state.metas[id]
    }
    commit('MutLoading', {
      key: tn || id,
      value: true
    })

    const model = await this.$api.meta.tableRead(
      id ||
      rootState
        .project
        .unserializedList[0]
        .projectJson
        .envs
        ._noco
        .db[0]
        .tables.find(t => t._tn === tn || t.tn === tn).id
    )
    // const model = await dispatch('sqlMgr/ActSqlOp', [{ env, dbAlias, project_id }, 'tableXcModelGet', { tn }], { root: true })
    // const meta = JSON.parse(model.meta)
    commit('MutMeta', {
      key: model.data.tn,
      value: model.data
    })
    commit('MutMeta', {
      key: model.data.id,
      value: model.data
    })
    commit('MutLoading', {
      key: tn || id,
      value: undefined
    })
    return force ? model : model
  }
}

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
