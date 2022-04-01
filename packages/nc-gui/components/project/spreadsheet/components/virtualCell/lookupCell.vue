<template>
  <div class="d-flex flex-wrap wrapper">
    <!--    <div class="chips d-flex align-center  lookup-items">
      <template v-if="localValue">
        <item-chip
          v-for="(value,i) in localValue"
          :key="i"
          :active="active"
          :value="value"
          :readonly="true"
        >
          <table-cell
            :column="lookUpColumn"
            :meta="lookUpMeta"
            :db-alias="nodes.dbAlias"
            :value="value"
            :sql-ui="sqlUi"
          />
        </item-chip>
      </template>
      <span
        v-if="localValue && localValue.length === 10"
        class="caption pointer ml-1 grey&#45;&#45;text"
        @click="showLookupListModal"
      >more...
      </span>
    </div>
    <list-child-items-modal
      v-if="lookUpMeta && lookupListModal"
      ref="childList"
      v-model="lookupListModal"
      :is-form="isForm"
      :is-new="isNew"
      :size="10"
      :meta="lookUpMeta"
      :parent-meta="meta"
      :primary-col="lookUpColumnAlias"
      :api="lookupApi"
      :password="password"
      :read-only="true"
      :query-params="queryParams"
      :metas="metas"
    />-->

    <template v-if="lookupColumnMeta">
      <template
        v-if="isVirtualCol(lookupColumnMeta)"
      >
        <template
          :is="virtualCell"
          v-if="lookupColumnMeta.uidt === UITypes.LinkToAnotherRecord &&lookupColumnMeta.colOptions.type === RelationTypes.BELONGS_TO && Array.isArray(value) "
        >
          <div
            :is="virtualCell"
            v-for="(v,i) in value"
            :key="i"
            :is-public="true"
            :metas="metas"
            :is-locked="true"
            :column="lookupColumnMeta"
            :row="{[lookupColumnMeta.title]:v}"
            :nodes="nodes"
            :meta="lookupTableMeta"
            :sql-ui="sqlUi"
          />
        </template>
        <div
          :is="virtualCell"
          v-else
          :is-public="true"
          :metas="metas"
          :is-locked="true"
          :column="lookupColumnMeta"
          :row="{[lookupColumnMeta.title]:value}"
          :nodes="nodes"
          :meta="lookupTableMeta"
          :sql-ui="sqlUi"
        />
      </template>
      <template v-else>
        <template v-if="localValue">
          <item-chip
            v-for="(value,i) in localValue"
            :key="i"
            style="margin: 1.5px"
            :active="active"
            :value="value"
            :readonly="true"
          >
            <table-cell

              :is-locked="true"
              :column="lookupColumnMeta"
              :meta="lookupTableMeta"
              :db-alias="nodes.dbAlias"
              :value="value"
              :sql-ui="sqlUi"
            />
          </item-chip>
        </template>
      </template>
    </template>
  </div>
</template>

<script>
import { isVirtualCol, RelationTypes, UITypes } from 'nocodb-sdk'
import TableCell from '../cell'
import ItemChip from '@/components/project/spreadsheet/components/virtualCell/components/itemChip'
export default {
  name: 'LookupCell',
  components: {
    TableCell,
    // ListChildItemsModal,
    ItemChip
  },
  props: {
    meta: [Object],
    metas: [Object],
    column: [Object],
    nodes: [Object],
    row: [Object],
    api: [Object, Function],
    sqlUi: [Object, Function],
    active: Boolean,
    isNew: Boolean,
    isForm: Boolean,
    value: [Object, Array, String, Number]
  },
  data: () => ({
    UITypes,
    lookupListModal: false,
    lookupTableMeta: null,
    lookupColumnMeta: null,
    isVirtualCol,
    RelationTypes
  }),
  computed: {
    virtualCell() {
      return this.lookupColumnMeta && isVirtualCol(this.lookupColumnMeta) ? () => import('@/components/project/spreadsheet/components/virtualCell') : 'div'
    },
    // todo : optimize
    lookupApi() {
      // return this.column && this.$ncApis.get({
      //   env: this.nodes.env,
      //   dbAlias: this.nodes.dbAlias,
      //   table: this.column.lk.ltn
      // })
    },
    lookUpMeta() {
      // return this.metas ? this.metas[this.column.lk.ltn] : this.$store.state.meta.metas[this.column.lk.ltn]
    },

    assocMeta() {
      // return this.column.lk.type === 'mm' && (this.metas ? this.metas[this.column.lk.vtn] : this.$store.state.meta.metas[this.column.lk.vtn])
    },
    lookUpColumnAlias() {
      if (!this.lookUpMeta || !this.column.lk.lcn) {
        return
      }
      return (this.lookUpMeta.columns.find(cl => cl.column_name === this.column.lk.lcn) || {}).title
    },
    lookUpColumn() {
      if (!this.lookUpMeta || !this.column.lk.lcn) {
        return
      }
      return (this.lookUpMeta.columns.find(cl => cl.column_name === this.column.lk.lcn) || {})
    },
    localValueObj() {
      // if (!this.column || !this.row) {
      //   return null
      // }
      // switch (this.column.lk.type) {
      //   case 'mm':
      //     return this.row[`${this.column.lk._ltn}MMList`]
      //   case 'hm':
      //     return this.row[`${this.column.lk._ltn}List`]
      //   case 'bt':
      //     return this.row[`${this.column.lk._ltn}Read`]
      //   default:
      //     return null
      // }
    },
    localValue() {
      return this.value && (Array.isArray(this.value) ? this.value : [this.value])
      // if (!this.localValueObj || !this.lookUpColumnAlias) {
      //   return null
      // }
      // if (Array.isArray(this.localValueObj)) {
      //   return this.localValueObj.map(o => o[this.lookUpColumnAlias])
      // }
      // return [this.localValueObj[this.lookUpColumnAlias]]
    },
    queryParams() {
      // switch (this.column.lk.type) {
      //   case 'bt':
      //     return { where: `(${this.lookUpMeta.columns.find(c => c.column_name === this.column.lk.rcn).title},eq,${this.row[this.meta.columns.find(c => c.column_name === this.column.lk.column_name).title]})` }
      //   case 'hm':
      //     return { where: `(${this.lookUpMeta.columns.find(c => c.column_name === this.column.lk.column_name).title},eq,${this.row[this.meta.columns.find(c => c.column_name === this.column.lk.rcn).title]})` }
      //   case 'mm':
      //     return this.assocMeta
      //       ? {
      //           conditionGraph: {
      //             [this.assocMeta.table_name]: {
      //               relationType: 'hm',
      //               [this.assocMeta.columns.find(c => c.column_name === this.column.lk.vcn).column_name]: {
      //                 eq: this.row[this.meta.columns.find(c => c.column_name === this.column.lk.column_name).title]
      //               }
      //             }
      //           }
      //         }
      //       : {}
      //   default:
      //     return {}
      // }
    }
  },
  created() {
    this.loadLookupMeta()
    this.loadLookupColumnMeta()
  },
  methods: {

    async loadLookupColumnMeta() {
      const relationColumn = this.meta.columns.find(c => c.id === this.column.colOptions.fk_relation_column_id)
      this.lookupTableMeta = await this.$store.dispatch('meta/ActLoadMeta', { id: relationColumn.colOptions.fk_related_model_id })
      this.lookupColumnMeta = this.lookupTableMeta.columns.find(c => c.id === this.column.colOptions.fk_lookup_column_id)
    },

    async loadLookupMeta() {
      // if (!this.metas && !this.lookUpMeta) {
      //   await this.$store.dispatch('meta/ActLoadMeta', {
      //     env: this.nodes.env,
      //     dbAlias: this.nodes.dbAlias,
      //     tn: this.column.lk.ltn
      //   })
      // }
      // if (!this.metas && this.column.lk.type === 'mm' && !this.assocMeta) {
      //   await this.$store.dispatch('meta/ActLoadMeta', {
      //     env: this.nodes.env,
      //     dbAlias: this.nodes.dbAlias,
      //     tn: this.column.lk.vtn
      //   })
      // }
    },
    showLookupListModal() {
      this.lookupListModal = true
    }
  }
}
</script>

<style scoped lang="scss">
.wrapper{
      flex-wrap: wrap;
  }
</style>
<!--
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
-->
