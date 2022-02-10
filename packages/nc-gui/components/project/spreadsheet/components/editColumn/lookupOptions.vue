<template>
  <div>
    <v-container fluid class="wrapper">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            ref="input"
            v-model="lookup.table"
            outlined
            class="caption"
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
                item.tn
              }}</span> <small>({{ relationNames[item.col.type] }})
              </small></span>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            ref="input"
            v-model="lookup.column"
            outlined
            class="caption"
            hide-details="auto"
            label="Child column"
            :full-width="false"
            :items="columnList"
            item-text="_cn"
            dense
            :loading="loadingColumns"
            :item-value="v => v"
            :rules="[v => !!v || 'Required',checkLookupExist]"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>

import { UITypes } from 'nc-common'

export default {
  name: 'LookupOptions',
  props: ['nodes', 'column', 'meta', 'isSQLite', 'alias'],
  data: () => ({
    lookup: {},
    loadingColumns: false,
    relationNames: {
      mm: 'Many To Many',
      hm: 'Has Many',
      bt: 'Belongs To'
    },
    tables: []
  }),
  computed: {
    refTables() {
      if (!this.tables || !this.tables.length) { return [] }

      const refTables = this.meta.columns.filter(c =>
        c.uidt === UITypes.LinkToAnotherRecord || c.uidt === UITypes.ForeignKey
      ).map(c => ({
        col: c.colOptions,
        ...this.tables.find(t => t.id === c.colOptions.fk_related_table_id)
      }))

      return refTables

      // return (this.meta
      //   ? [
      //       ...(this.meta.belongsTo || []).map(({ rtn, _rtn, rcn, tn, cn }) => ({
      //         type: 'bt',
      //         rtn,
      //         _rtn,
      //         rcn,
      //         tn,
      //         cn,
      //         ltn: rtn,
      //         _ltn: _rtn
      //       })),
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
      //         ltn: tn,
      //         _ltn: _tn
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
      //         ltn: rtn,
      //         _ltn: _rtn
      //       }))
      //     ]
      //   : []).filter(t => this.tables.includes(t.ltn))
    },
    columnList() {
      return ((
        this.lookup &&
        this.lookup.table &&
        this.$store.state.meta.metas &&
        this.$store.state.meta.metas[this.lookup.table.id] &&
        this.$store.state.meta.metas[this.lookup.table.id].columns
      ) || [])
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
    checkLookupExist(v) {
      return (this.lookup.table && (this.meta.v || []).every(c => !(
        c.lk &&
        c.lk.type === this.lookup.table.type &&
        c.lk.ltn === this.lookup.table.ltn &&
        c.lk.lcn === v.lcn
      ))) || 'Lookup already exist'
    },
    async onTableChange() {
      this.loadingColumns = true
      if (this.lookup.table) {
        try {
          await this.$store.dispatch('meta/ActLoadMeta', {
            dbAlias: this.nodes.dbAlias,
            env: this.nodes.env,
            id: this.lookup.table.id
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

        // meta.v.push({
        //   _cn: this.alias,
        //   lk: {
        //     ...this.lookup.table,
        //     ...this.lookup.column
        //   }
        // })

        console.log(this.lookup)

        const lookupCol = {
          _cn: this.alias,
          fk_relation_column_id: this.lookup.table.col.fk_column_id,
          fk_lookup_column_id: this.lookup.column.id,
          uidt: UITypes.Lookup
        }

        const col = await this.$api.meta.columnCreate(this.meta.id, lookupCol)

        console.log(col.data)
        // await this.$store.dispatch('sqlMgr/ActSqlOp', [{
        //   env: this.nodes.env,
        //   dbAlias: this.nodes.dbAlias
        // }, 'xcModelSet', {
        //   tn: this.nodes.tn,
        //   meta
        // }])

        return this.$emit('saved', this.alias)
      } catch (e) {
        console.log(e)
        this.$toast.error(e.message).goAway(3000)
      }
    }
  }
}
</script>

<style scoped>

</style>
