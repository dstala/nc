<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-badge
        :value="isAnyFieldHidden"
        color="primary"
        dot
        overlap
      >
        <v-btn
          class="nc-fields-menu-btn px-2 nc-remove-border"
          :disabled="isLocked"
          outlined
          small
          text
          :class=" { 'primary lighten-5 grey--text text--darken-3' : isAnyFieldHidden}"
          v-on="on"
        >
          <v-icon small class="mr-1" color="#777">
            mdi-eye-off-outline
          </v-icon>
          Fields
          <v-icon small color="#777">
            mdi-menu-down
          </v-icon>
        </v-btn>
      </v-badge>
    </template>

    <v-list dense class="pt-0" min-width="280" @click.stop>
      <template v-if="isGallery">
        <div class="pa-2">
          <v-select
            v-model="coverImageFieldLoc"
            label="Cover Image"
            class="caption field-caption"
            dense
            outlined
            :items="attachmentFields"
            item-text="alias"
            item-value="id"
            hide-details
            @click.stop
          >
            <template #prepend-inner>
              <v-icon small class="field-icon">
                mdi-image
              </v-icon>
            </template>
          </v-select>
        </div>
        <v-divider />
      </template>

      <template v-if="isKanban">
        <div class="pa-2">
          <v-select
            v-model="groupingFieldLoc"
            label="Grouping Field"
            class="caption field-caption"
            dense
            outlined
            :items="singleSelectFields"
            item-text="alias"
            item-value="_cn"
            hide-details
            @click.stop
          >
            <template #prepend-inner>
              <v-icon small class="field-icon">
                mdi-select-group
              </v-icon>
            </template>
          </v-select>
        </div>
        <v-divider />
      </template>

      <v-list-item
        dense
        class=""
      >
        <v-text-field
          v-model="fieldFilter"
          dense
          flat
          class="caption mt-3 mb-2"
          color="grey"
          placeholder="Search fields"
          hide-details
          @click.stop
        >
          <!--          <template v-slot:prepend-inner>
                      <v-icon small color="grey" class="mt-2">
                        mdi-magnify
                      </v-icon>
                    </template>-->
        </v-text-field>
      </v-list-item>
      <draggable
        v-model="fields"
        @start="drag=true"
        @end="drag=false"
        @change="onMove($event)"
      >
        <template
          v-for="(field,i) in fields"
        >
          <v-list-item
            v-show="(!fieldFilter || (field._cn||'').toLowerCase().includes(fieldFilter.toLowerCase()))
              && !(!showSystemFieldsLoc && systemColumnsIds.includes(field.fk_column_id))
            "
            :key="field.id"
            dense
          >
            <v-checkbox
              v-model="field.show"
              class="mt-0 pt-0"
              dense
              hide-details
              @click.stop
              @change="saveOrUpdate(field, i)"
            >
              <template #label>
                <span class="caption">{{ field._cn }}</span>
              </template>
            </v-checkbox>
            <v-spacer />
            <v-icon small color="grey" class="align-self-center drag-icon">
              mdi-drag
            </v-icon>
          </v-list-item>
        </template>
      </draggable>
      <v-divider
        class="my-2"
      />

      <v-list-item v-if="!isPublic" dense>
        <v-checkbox
          v-model="showSystemFieldsLoc"
          class="mt-0 pt-0"
          dense
          hide-details
          @click.stop
        >
          <template #label>
            <span class="caption">Show System Fields</span>
          </template>
        </v-checkbox>
      </v-list-item>
      <v-list-item dense class="mt-2 list-btn mb-3">
        <v-btn small class="elevation-0 grey--text" @click.stop="showAll">
          Show All
        </v-btn>
        <v-btn small class="elevation-0 grey--text" @click.stop="hideAll">
          Hide All
        </v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import draggable from 'vuedraggable'
import { getSystemColumnsIds } from 'nc-common'

export default {
  name: 'FieldsMenu',
  components: {
    draggable
  },
  props: {
    coverImageField: String,
    groupingField: String,
    isGallery: Boolean,
    isKanban: Boolean,
    sqlUi: [Object, Function],
    meta: Object,
    fieldsOrder: [Array],
    value: [Object, Array],
    fieldList: [Array, Object],
    showSystemFields: {
      type: Boolean,
      default: false
    },
    isLocked: Boolean,
    isPublic: Boolean,
    viewId: String
  },
  data: () => ({
    fields: [],
    fieldFilter: '',
    showFields: {},
    fieldsOrderLoc: []
  }),
  computed: {
    systemColumnsIds() {
      return getSystemColumnsIds(this.meta && this.meta.columns)
    },
    attachmentFields() {
      return [...(this.meta && this.meta.columns ? this.meta.columns.filter(f => f.uidt === 'Attachment') : []), {
        alias: 'None',
        id: null
      }]
    },
    singleSelectFields() {
      return [...(this.meta && this.meta.columns ? this.meta.columns.filter(f => f.uidt === 'SingleSelect') : []), {
        alias: 'None',
        id: null
      }]
    },
    coverImageFieldLoc: {
      get() {
        return this.coverImageField
      },
      set(val) {
        this.$emit('update:coverImageField', val)
      }
    },
    groupingFieldLoc: {
      get() {
        return this.groupingField
      },
      set(val) {
        this.$emit('update:groupingField', val)
      }
    },
    columnMeta() {
      return this.meta && this.meta.columns
        ? this.meta.columns.reduce((o, c) => ({
          ...o,
          [c._cn]: c
        }), {})
        : {}
    },

    isAnyFieldHidden() {
      return Object.values(this.showFields).some(v => !v)
    },
    showSystemFieldsLoc: {
      get() {
        return this.showSystemFields
      },
      set(v) {
        this.$emit('update:showSystemFields', v)
      }
    }
    // viewId() {
    //   return this.meta && this.meta.views && this.meta.views[0] && this.meta.views[0].id
    // }
  },
  watch: {
    async viewId(v) {
      if (v) {
        await this.loadFields()
      }
    },
    fieldList(f) {
      this.fieldsOrderLoc = [...f]
    },
    showFields: {
      handler(v) {
        this.$nextTick(() => {
          this.$emit('input', v)
        })
      },
      deep: true
    },
    value(v) {
      this.showFields = v || []
    },
    fieldsOrder(n, o) {
      if ((n && n.join()) !== (o && o.join())) {
        this.fieldsOrderLoc = n
      }

      this.fieldsOrderLoc = n && n.length ? n : [...this.fieldList]
    },
    fieldsOrderLoc: {
      handler(n, o) {
        if ((n && n.join()) !== (o && o.join())) {
          this.$emit('update:fieldsOrder', n)
        }
      },
      deep: true
    }
  },
  created() {
    this.loadFields()
    this.showFields = this.value
    this.fieldsOrderLoc = this.fieldsOrder && this.fieldsOrder.length ? this.fieldsOrder : [...this.fieldList]
  },
  methods: {
    async loadFields() {
      let fields = []
      let order = 1
      if (this.viewId) {
        const data = await this.$api.meta.viewColumnList(this.viewId)
        const fieldById = data.data.reduce((o, f) => ({
          ...o,
          [f.fk_column_id]: f
        }), {})
        fields = this.meta.columns.map(c => ({
          _cn: c._cn,
          fk_column_id: c.id,
          ...(fieldById[c.id] ? fieldById[c.id] : {}),
          order: (fieldById[c.id] && fieldById[c.id].order) || order++
        })
        ).sort((a, b) => a.order - b.order)
      } else if (this.isPublic) {
        fields = this.meta.columns
      }

      this.fields = fields

      this.$emit('input', this.fields.reduce((o, c) => ({
        ...o,
        [c._cn]: c.show
      }), {}))
      this.$emit('update:fieldsOrder', this.fields.map(c => c._cn))
    },
    async saveOrUpdate(field, i) {
      if (!this.isPublic) {
        if (field.id) {
          await this.$api.meta.viewColumnUpdate(this.viewId, field.id, field)
        } else {
          this.fields[i] = (await this.$api.meta.viewColumnCreate(this.viewId, field)).data
        }
      }
      this.$emit('updated')
      this.$emit('input', this.fields.reduce((o, c) => ({
        ...o,
        [c._cn]: c.show
      }), {}))
      this.$emit('update:fieldsOrder', this.fields.map(c => c._cn))
    },
    async showAll() {
      if (!this.isPublic) { await this.$api.meta.viewShowAllColumn({ viewId: this.viewId }) }
      for (const f of this.fields) {
        f.show = true
      }
      this.$emit('updated')

      // eslint-disable-next-line no-return-assign,no-sequences
      this.showFields = (this.fieldsOrderLoc || Object.keys(this.showFields)).reduce((o, k) => (o[k] = true, o), {})
    },
    async hideAll() {
      if (!this.isPublic) { await this.$api.meta.viewHideAllColumn({ viewId: this.viewId }) }
      for (const f of this.fields) {
        f.show = false
      }
      this.$emit('updated')

      this.$nextTick(() => {
        this.showFields = (this.fieldsOrderLoc || Object.keys(this.showFields)).reduce((o, k) => (o[k] = false, o), {})
      })
    },
    onMove(event) {
      if (this.fields.length - 1 === event.moved.newIndex) {
        this.$set(this.fields[event.moved.newIndex], 'order', this.fields[event.moved.newIndex - 1].order + 1)
      } else if (event.moved.newIndex === 0) {
        this.$set(this.fields[event.moved.newIndex], 'order', this.fields[1].order / 2)
      } else {
        this.$set(this.fields[event.moved.newIndex], 'order', (
          this.fields[event.moved.newIndex - 1].order + this.fields[event.moved.newIndex + 1].order) / 2
        )
      }
      this.saveOrUpdate(this.fields[event.moved.newIndex], event.moved.newIndex)
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
  .v-list-item {
    min-height: 30px;
  }

  .v-input--checkbox .v-icon {
    font-size: 12px !important;
  }

  .field-caption {
    .v-input__append-inner {
      margin-top: 4px !important;
    }

    .v-input__slot {
      min-height: 25px !important;
    }

    &.v-input input {
      max-height: 20px !important;
    }

    .field-icon {
      margin-top: 2px;
    }
  }
}

.drag-icon {
  cursor: all-scroll; /*cursor: grab;*/
}

</style>
