<template>
  <div>
    <v-container fluid class="wrapper">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            ref="input"
            v-model="rollup.table"
            outlined
            class="caption nc-rollup-table"
            hide-details="auto"
            label="Child Table"
            :full-width="false"
            :items="refTables"
            item-text="_tn"
            :item-value="v => v"
            :rules="[v => !!v || 'Required']"
            dense
          >
            <template #item="{item}">
              <span class="caption"><span class="font-weight-bold"> {{
                item._tn
              }}</span> <small>({{ relationNames[item.col.type] }})
              </small></span>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            ref="input"
            v-model="rollup.column"
            outlined
            class="caption  nc-rollup-column"
            hide-details="auto"
            label="Child column"
            :full-width="false"
            :items="columnList"
            item-text="_cn"
            dense
            :loading="loadingColumns"
            :item-value="v => v"
            :rules="[v => !!v || 'Required']"
          />
        </v-col>
        <v-col cols="12">
          <v-autocomplete
            ref="aggrInput"
            v-model="rollup.fn"
            outlined
            class="caption  nc-rollup-fn"
            hide-details="auto"
            label="Aggregate function"
            :full-width="false"
            :items="aggrFunctionsList"
            dense
            :loading="loadingColumns"
            :rules="[v => !!v || 'Required']"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>

import { UITypes } from 'nc-common'

export default {
  name: 'RollupOptions',
  props: ['nodes', 'column', 'meta', 'isSQLite', 'alias'],
  data: () => ({
    rollup: {},
    loadingColumns: false,
    tables: [],
    relationNames: {
      mm: 'Many To Many',
      hm: 'Has Many'
      // bt: 'Belongs To'
    },
    aggrFunctionsList: [
      { text: 'count', value: 'count' },
      { text: 'min', value: 'min' },
      { text: 'max', value: 'max' },
      { text: 'avg', value: 'avg' },
      { text: 'min', value: 'min' },
      { text: 'sum', value: 'sum' },
      { text: 'countDistinct', value: 'countDistinct' },
      { text: 'sumDistinct', value: 'sumDistinct' },
      { text: 'avgDistinct', value: 'avgDistinct' }
    ]
  }),
  computed: {
    refTables() {
      if (!this.tables || !this.tables.length) { return [] }

      const refTables = this.meta.columns.filter(c =>
        c.uidt === UITypes.LinkToAnotherRecord && c.colOptions.type !== 'bt'
      ).map(c => ({
        col: c.colOptions,
        ...this.tables.find(t => t.id === c.colOptions.fk_related_table_id)
      }))

      return refTables

      // return (this.meta
      //   ? [
      //     // ...(this.meta.belongsTo || []).map(({ rtn, _rtn, rcn, tn, cn }) => ({
      //     //   type: 'bt',
      //     //   rtn,
      //     //   _rtn,
      //     //   rcn,
      //     //   tn,
      //     //   cn,
      //     //   ltn: rtn,
      //     //   _ltn: _rtn
      //     // })),
      //       ...(this.meta.hasMany || []).map(({
      //         tn,
      //         _tn,
      //         cn,
      //         rcn,
      //         rtn
      //       }) => ({
      //         type: 'hm',
      //         tn,
      //         _tn,
      //         cn,
      //         rcn,
      //         rtn,
      //         rltn: tn,
      //         _rltn: _tn
      //       })),
      //       ...(this.meta.manyToMany || []).map(({ vtn, _vtn, vrcn, vcn, rtn, _rtn, rcn, tn, cn }) => ({
      //         type: 'mm',
      //         tn,
      //         cn,
      //         vtn,
      //         _vtn,
      //         vrcn,
      //         rcn,
      //         rtn,
      //         vcn,
      //         _rtn,
      //         rltn: rtn,
      //         _rltn: _rtn
      //       }))
      //     ]
      //   : []).filter(t => this.tables.includes(t.rltn))
    },
    columnList() {
      return ((
        this.rollup &&
        this.rollup.table &&
        this.$store.state.meta.metas &&
        this.$store.state.meta.metas[this.rollup.table.tn] &&
        this.$store.state.meta.metas[this.rollup.table.tn].columns
      ) || []).filter(col => ![UITypes.Lookup, UITypes.Rollup, UITypes.ForeignKey, UITypes.LinkToAnotherRecord].includes(col.uidt))
    }
  },
  async mounted() {
    await this.loadTablesList()
  },
  methods: {
    async loadTablesList() {
      const result = (await this.$api.meta.tableList({
        projectId: this.$store.state.project.projectId,
        baseId: this.$store.state.project.project.bases[0].id
      })).data

      //   await this.$store.dispatch('sqlMgr/ActSqlOp', [{
      //   env: this.nodes.env,
      //   dbAlias: this.nodes.dbAlias
      // }, 'tableList'])

      this.tables = result.tables.list
    },
    async onTableChange() {
      this.loadingColumns = true
      if (this.rollup.table) {
        try {
          await this.$store.dispatch('meta/ActLoadMeta', {
            dbAlias: this.nodes.dbAlias,
            env: this.nodes.env,
            id: this.rollup.table.id
          })
        } catch (e) {
          // ignore
        }
      }

      this.loadingColumns = false
    },
    async save() {
      try {
        // await this.$store.dispatch('meta/ActLoadMeta', {
        //   dbAlias: this.nodes.dbAlias,
        //   env: this.nodes.env,
        //   tn: this.meta.tn,
        //   force: true
        // })
        // const meta = JSON.parse(JSON.stringify(this.$store.state.meta.metas[this.meta.tn]))
        //
        // meta.v.push({
        //   _cn: this.alias,
        //   rl: {
        //     ...this.rollup.table,
        //     ...this.rollup.column,
        //     fn: this.rollup.fn
        //   }
        // })
        //
        // await this.$store.dispatch('sqlMgr/ActSqlOp', [{
        //   env: this.nodes.env,
        //   dbAlias: this.nodes.dbAlias
        // }, 'xcModelSet', {
        //   tn: this.nodes.tn,
        //   meta
        // }])

        console.log(this.rollup)

        const rollupCol = {
          _cn: this.alias,
          fk_relation_column_id: this.rollup.table.col.fk_column_id,
          fk_rollup_column_id: this.rollup.column.id,
          uidt: UITypes.Rollup,
          rollup_function: this.rollup.fn
        }

        const col = await this.$api.meta.columnCreate(this.meta.id, rollupCol)

        console.log(col.data)

        return this.$emit('saved', this.alias)
      } catch (e) {
        this.$toast.error(e.message).goAway(3000)
      }
    }
  }
}
</script>

<style scoped>

</style>
