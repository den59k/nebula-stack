<template>
  <div class="table-view__layout">
    <ul class="form-editor__available-fields">
      <li v-for="item in props.fields" class="form-editor__available-fields-item" @mousedown="onItemMouseDown($event, item)">
        {{ item.name }}
      </li>
    </ul>
    <div ref="workAreaRef" class="table-view__work-area">
      <table >
        <thead>
          <tr>
            <th 
              v-for="item in columns" 
              @mousedown="onColumnMouseDown($event, item)" 
              @contextmenu="contextMenu.open($event, item)"
            >
              {{ item.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>

          </tr>
        </tbody>
      </table>
      <div 
        v-for="(place, index) in places" 
        class="table-view__place" 
        :style="place" 
        @columndrop="onPlaceColumnDrop($event, index)"
      ></div>
    </div>
    <VContextMenu v-bind="contextMenu.props" />
  </div>
</template>

<script lang="ts" setup>
import { CSSProperties, Ref, computed, ref, watch } from 'vue';
import { useDraggableItem } from 'vuesix';
import { useContextMenu } from '../VContextMenu.vue';
import { useVModel } from '@vueuse/core';
import { Field } from '../../api/tablesApi';

const props = defineProps<{ modelValue?: TableColumn[], fields: Field[] }>()
const emit = defineEmits([ "update:modelValue" ])

const drag = useDraggableItem()
const dragMode = ref(false)
const onItemMouseDown = (e: MouseEvent, item: Field) => {
  drag(e, {
    onStart(item) {
      item.classList.add("drag")
      dragMode.value = true
    },
    onEnd(e) {
      const column: TableColumn = { fieldId: item.name, name: item.name }
      e.target?.dispatchEvent(new ColumnDropEvent(column))
      dragMode.value = false
    }
  })
}

const onColumnMouseDown = (e: MouseEvent, item: TableColumn) => {
  drag(e, {
    onStart(item) {
      item.classList.add("d-none")
      dragMode.value = true
    },
    onEnd(e) {
      e.target?.dispatchEvent(new ColumnDropEvent(item))
      dragMode.value = false
    }
  })
}

const places = ref<Array<CSSProperties>>([])
const workAreaRef = ref<HTMLDivElement>()
watch(dragMode, (dragMode) => {
  if (!workAreaRef.value) return
  
  places.value = []
  if (dragMode) {
    const parentRect = workAreaRef.value.getBoundingClientRect()
    const columnsEl = workAreaRef.value.querySelectorAll("th")
    let paddingLeft = 0
    let offsetLeft = 0
    for (let i = 0; i <= columnsEl.length; i++) {
      let right = 0
      if (i < columnsEl.length) {
        const itemRect = columnsEl[i].getBoundingClientRect()
        right = itemRect.left - parentRect.left + itemRect.width/2
        paddingLeft = itemRect.left - parentRect.left - offsetLeft
      } else {
        right = parentRect.width
        paddingLeft = columnsEl.length === 0? 16: (right - offsetLeft - 16)
      }
      places.value.push({ left: `${offsetLeft}px`, width: `${right-offsetLeft}px`, paddingLeft: `${paddingLeft}px` })
      offsetLeft = right
    }
  }
})

const columns = useVModel(props, "modelValue", emit, { passive: true, defaultValue: [] }) as Ref<TableColumn[]>
const fieldsMap = computed(() => new Map(props.fields.map(item => [ item.name, item ])))

const onPlaceColumnDrop = (e: ColumnDropEvent, index: number) => {
  const existIndex = columns.value.findIndex(item => item === e.column)
  if (existIndex >= 0) {
    if (existIndex === index || existIndex+1 === index) return
    columns.value.splice(existIndex, 1)
  }
  columns.value.splice(index, 0, e.column)
}

const contextMenu = useContextMenu((item: TableColumn) => [
  { title: "Удалить столбец", onClick() {
    const index = columns.value.indexOf(item)
    if (index >= 0) columns.value.splice(index, 1)
  }}
])

</script>

<script lang="ts">

export type TableColumn = {
  fieldId: string
  name: string
}

export class ColumnDropEvent extends Event {
  column: TableColumn
  constructor(column: TableColumn) {
    super("columndrop")
    this.column = column
  }
}


</script>

<style lang="sass">
.table-view__layout
  display: flex

.table-view__work-area
  flex: 1 1 auto
  padding: 16px
  position: relative

  table
    width: 100%
    border-collapse: collapse

  th
    border-bottom: 1px solid var(--input-border-color)
    width: 200px
    height: 32px
    font-size: 14px

    &:not(:last-child)
      border-right: 1px solid var(--border-color)

    &:hover
      background-color: var(--hover-color)
      cursor: pointer

.table-view__place
  position: absolute
  top: 16px
  bottom: 16px
  box-sizing: border-box

  &:after
    content: ""
    height: 100%
    width: 2px
    background-color: var(--primary-color)
    display: none

  &:hover:after
    display: block

</style>