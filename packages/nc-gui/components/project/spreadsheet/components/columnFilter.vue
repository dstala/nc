<template>
  <div
    class="backgroundColor pa-2"
    style="width:530px"
  >
    <div class="grid" @click.stop>
      <template v-for="(filter,i) in filters" dense>
        <v-icon
          v-if="!filter.readOnly"
          :key="i + '_3'"
          small
          class="nc-filter-item-remove-btn"
          @click.stop="deleteFilter(filter,i)"
        >
          mdi-close-box
        </v-icon>
        <span v-else :key="i + '_1'" />

        <!--        <span
          v-if="!i"
          :key="i + '_2'"
          class="caption d-flex align-center"
        >where</span>

        <v-select
          v-else
          :key="i + '_4'"
          v-model="filter.logicOp"
          class="flex-shrink-1 flex-grow-0 elevation-0 caption "
          :items="['and' ,'or']"
          solo
          flat
          dense
          hide-details
          :disabled="filter.readOnly"
          @click.stop
        >
          <template #item="{item}">
            <span class="caption font-weight-regular">{{ item }}</span>
          </template>
        </v-select>-->
        <!--        <v-text-field-->
        <!--          v-if="filter.readOnly"-->
        <!--          :key="i + '_5'"-->
        <!--          v-model="filter.field"-->
        <!--          class="caption "-->
        <!--          placeholder="Field"-->
        <!--          solo-->
        <!--          flat-->
        <!--          dense-->
        <!--          disabled-->
        <!--          hide-details-->
        <!--          @click.stop-->
        <!--        >-->
        <!--          <template #item="{item}">-->
        <!--            <span class="caption font-weight-regular">{{ item }}</span>-->
        <!--          </template>-->
        <!--        </v-text-field>-->
        <!--        v-else-->

        <v-select
          :key="i + '_6'"
          v-model="filter.fk_column_id"
          class="caption nc-filter-field-select"
          :items="meta.columns"
          placeholder="Field"
          solo
          flat
          dense
          :disabled="filter.readOnly"
          hide-details
          item-value="id"
          item-text="_cn"
          @click.stop
          @change="saveOrUpdate(filter, i)"
        >
          <template #item="{item}">
            <span class="caption font-weight-regular">{{ item._cn }}</span>
          </template>
        </v-select>
        <v-select
          :key="'k' + i"
          v-model="filter.comparison_op"
          class="flex-shrink-1 flex-grow-0 caption  nc-filter-operation-select"
          :items="comparisonOp"
          placeholder="Operation"
          solo
          flat
          style="max-width:120px"
          dense
          :disabled="filter.readOnly"
          hide-details
          item-value="value"
          @click.stop
          @change="saveOrUpdate(filter, i)"
        >
          <template #item="{item}">
            <span class="caption font-weight-regular">{{ item.text }}</span>
          </template>
        </v-select>
        <span v-if="['is null', 'is not null'].includes(filter.op)" :key="'span' + i" />
        <v-checkbox
          v-else-if="types[filter.field] === 'boolean'"
          :key="i + '_7'"
          v-model="filter.value"
          dense
          :disabled="filter.readOnly"
          @change="saveOrUpdate(filter, i)"
        />
        <v-text-field
          v-else
          :key="i + '_7'"
          v-model="filter.value"
          solo
          flat
          hide-details
          dense
          class="caption nc-filter-value-select"
          :disabled="filter.readOnly"
          @click.stop
          @input="saveOrUpdate(filter, i)"
        />
      </template>
    </div>

    <!--    <v-list-item dense class="pt-2 list-btn">
          <v-btn @click.stop="addFilter" small class="elevation-0 grey&#45;&#45;text">
            <v-icon small color="grey">mdi-plus</v-icon>
            Add Filter
          </v-btn>
        </v-list-item>-->

    <v-btn small class="elevation-0 grey--text my-3" @click.stop="addFilter">
      <v-icon small color="grey">
        mdi-plus
      </v-icon>
      Add Filter
    </v-btn>
    <slot />
  </div>
</template>

<script>
import { UITypes } from '~/components/project/spreadsheet/helpers/uiTypes'

export default {
  name: 'ColumnFilter',
  props: ['fieldList', 'meta'],
  data: () => ({
    filters: [],
    opList: [
      'is equal', 'is not equal', 'is like', 'is not like',
      // 'is empty', 'is not empty',
      'is null', 'is not null',
      '>',
      '<',
      '>=',
      '<='
    ],
    comparisonOp: [
      { text: 'is equal', value: 'eq' },
      { text: 'is not equal', value: 'neq' },
      { text: 'is like', value: 'like' },
      { text: 'is not like', value: 'nlike' },
      // 'is empty', 'is not empty',
      // 'is null', 'is not null',
      { text: '>', value: 'gt' },
      { text: '<', value: 'lt' },
      { text: '>=', value: 'gte' },
      { text: '<=', value: 'lte' }
    ]
  }),
  computed: {
    types() {
      if (!this.meta || !this.meta.columns || !this.meta.columns.length) { return {} }

      return this.meta.columns.reduce((obj, col) => {
        switch (col.uidt) {
          case UITypes.Number:
          case UITypes.Decimal:
            obj[col._cn] = obj[col.cn] = 'number'
            break
          case UITypes.Checkbox:
            obj[col._cn] = obj[col.cn] = 'boolean'
            break
          default:
            break
        }
        return obj
      }, {})
    },
    viewId() {
      return this.meta && this.meta.views && this.meta.views[0] && this.meta.views[0].id
    }
  },
  watch: {
    async viewId(v) {
      if (v) {
        await this.loadFilter()
      }
    },
    filters: {
      handler(v) {
        this.$emit('input', v)
      },
      deep: true
    }
  },
  created() {
    this.loadFilter()
  },
  methods: {
    async loadFilter() {
      let filters = []

      if (this.viewId) {
        const data = await this.$api.meta.filterRead(this.viewId)
        filters = data.data
      }

      this.filters = filters
    },
    addFilter() {
      this.filters.push({
        // field: '',
        // op: '',
        // value: '',
        // logicOp: 'and'

        fk_column_id: null,
        comparison_op: 'eq',
        value: ''

      })
      this.filters = this.filters.slice()
    },
    async saveOrUpdate(filter, i) {
      if (filter.id) {
        await this.$api.meta.filterUpdate(this.viewId, filter.id, filter)
      } else {
        this.filters[i] = (await this.$api.meta.filterCreate(this.viewId, filter)).data
      }
      this.$emit('updated')
    },
    async deleteFilter(filter, i) {
      if (filter.id) {
        await this.$api.meta.filterDelete(this.viewId, filter.id)
        await this.loadFilter()
      } else {
        this.sortList.splice(i, 1)
      }
      this.$emit('updated')
    }
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns:22px 120px 110px auto;
  column-gap: 6px;
  row-gap: 6px
}
</style>
