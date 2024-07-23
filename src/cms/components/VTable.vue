<template>
  <div class="v-table" :style="gridStyle">
    <div class="v-table__header">
      <div v-for="item in columns">
        {{ item.title }}
      </div>
    </div>
    <component 
      v-for="(item, index) in data" 
      :key="index" 
      :is="is(item)" 
      v-bind="bind(item)" 
      class="v-table__row" 
      @click="emit('itemclick', item)"
      @contextmenu="emit('itemcontext', $event, item)"
    >
      <div v-for="(column, key) in columns" :key="key" >
        <slot :name="key" :item="item" :cell="item[key as keyof T]">
          {{ column.map? column.map(item): item[key as keyof T] }}
        </slot>
      </div>
    </component>
  </div>
</template>

<script lang="ts" setup generic="T">
import { CSSProperties, computed } from 'vue';

const props = defineProps<{ 
  data: T[],
  clickable?: boolean,
  to?: (item: T) => string,
  columns: Columns<T>
}>()

const emit = defineEmits([ "itemclick", "itemcontext" ])

const is = (item: T) => {
  const to = props.to?.(item)
  if (to) return 'router-link'
  if (props.clickable) return 'button'
  return 'div'
}

const bind = (item: T) => {
  const to = props.to?.(item)
  if (to) {
    return { to }
  } else {
    return {}
  }
}

const gridStyle = computed<CSSProperties>(() => {
  return {
    gridTemplateColumns: Object.values(props.columns).map(item => item.width ?? '1fr').join(" ")
  }
})

</script>

<script lang="ts">

type Column<T> = {
  title?: string,
  class?: string,
  width?: string,
  map?: (item: T) => string
}

export type Columns<T> = Record<string, Column<T>>

</script>

<style lang="sass">
.v-table
  display: grid
  grid-template-columns: 1fr 1fr 1fr
  margin: 0 -24px

.v-table__header, .v-table__row
  display: grid
  grid-template-columns: subgrid
  grid-column: 1 / -1
  align-items: center
  padding: 0 24px

.v-table__header
  font-size: 13px
  font-weight: 500
  color: var(--text-secondary-color)
  height: 24px

.v-table__row
  height: 50px
  text-decoration: none
  color: var(--text-color)
  font-weight: 500
  text-align: left
  background: none
  border: none
  font-size: 14px

  &:hover
    background-color: var(--hover-color)
</style>