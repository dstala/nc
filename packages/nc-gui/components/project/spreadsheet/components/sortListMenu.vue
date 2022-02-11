<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-badge
        :value="sortList.length"
        color="primary"
        dot
        overlap
      >
        <v-btn
          class="nc-sort-menu-btn px-2 nc-remove-border"
          :disabled="isLocked"
          small
          text
          outlined
          :class=" { 'primary lighten-5 grey--text text--darken-3' : sortList.length}"
          v-on="on"
        >
          <v-icon small class="mr-1" color="#777">
            mdi-sort
          </v-icon>
          Sort
          <v-icon small color="#777">
            mdi-menu-down
          </v-icon>
        </v-btn>
      </v-badge>
    </template>
    <div class="backgroundColor pa-2" style="min-width: 330px">
      <div class="sort-grid" @click.stop>
        <template v-for="(sort,i) in sortList" dense>
          <v-icon :key="i + 'icon'" class="nc-sort-item-remove-btn" small @click.stop="deleteSort(sort)">
            mdi-close-box
          </v-icon>

          <v-select
            :key="i + 'sel1'"
            v-model="sort.fk_column_id"
            class="caption nc-sort-field-select"
            :items="meta.columns"
            item-value="id"
            item-text="_cn"
            label="Field"
            solo
            flat
            dense
            hide-details
            @click.stop
            @change="saveOrUpdate(sort, i)"
          >
            <template #item="{item}">
              <span class="caption font-weight-regular">{{ item._cn }}</span>
            </template>
          </v-select>
          <v-select
            :key="i + 'sel2'"
            v-model="sort.direction"
            class="flex-shrink-1 flex-grow-0 caption nc-sort-dir-select"
            :items="[{text : 'A -> Z', value: 'asc'},{text : 'Z -> A', value: 'desc'}]"
            label="Operation"
            solo
            flat
            dense
            hide-details
            @click.stop
            @change="saveOrUpdate(sort, i)"
          >
            <template #item="{item}">
              <span class="caption font-weight-regular">{{ item.text }}</span>
            </template>
          </v-select>
        </template>
      </div>
      <v-btn small class="elevation-0 grey--text my-3" @click.stop="addSort">
        <v-icon small color="grey">
          mdi-plus
        </v-icon>
        Add Sort Option
      </v-btn>
    </div>
  </v-menu>
</template>

<script>
export default {
  name: 'SortListMenu',
  props: ['fieldList', 'value', 'isLocked', 'meta'],
  data: () => ({
    sortList: []
  }),
  computed: {
    viewId() {
      return this.meta && this.meta.views && this.meta.views[0] && this.meta.views[0].id
    }
  },
  watch: {
    sortList: {
      handler(v) {
        this.$emit('input', v)
      },
      deep: true
    },
    value(v) {
      this.sortList = v || []
    },
    async viewId(v) {
      if (v) {
        await this.loadSortList()
      }
    }
  },
  async created() {
    this.loadSortList()
  },
  methods: {
    addSort() {
      this.sortList.push({
        fk_column_id: null,
        direction: 'asc'
      })
      this.sortList = this.sortList.slice()
    },
    async loadSortList() {
      let sortList = []

      if (this.viewId) {
        const data = await this.$api.meta.sortList(this.viewId)
        sortList = data.data.sorts.list
      }

      this.sortList = sortList
    },
    async saveOrUpdate(sort, i) {
      if (sort.id) {
        await this.$api.meta.sortUpdate(this.viewId, sort.id, sort)
      } else {
        this.sortList[i] = (await this.$api.meta.sortCreate(this.viewId, sort)).data
      }
      this.$emit('updated')
    },
    async deleteSort(sort, i) {
      if (sort.id) {
        await this.$api.meta.sortDelete(this.viewId, sort.id)
        await this.loadSortList()
      } else {
        this.sortList.splice(i, 1)
      }
      this.$emit('updated')
    }
  }
}
</script>

<style scoped>

.sort-grid {
  display: grid;
  grid-template-columns:22px auto 100px;
  column-gap: 6px;
  row-gap: 6px;
}

</style>
