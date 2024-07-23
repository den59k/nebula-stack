<template>
  <slot name="activator" :props="activatorProps"></slot>
  <VPopover
    v-model:open="open" 
    :element="activatorElement" 
    :anchorPosition="props.anchorPosition"
    :placement="props.placement ?? 'bottom-start'" 
    :offset="offset" 
    class="v-context-menu"
  >
    <VButton 
      v-for="item in items" 
      v-bind="item.props"
      class="v-context-menu__item" 
      @click="onItemClick(item)"
    >
      {{ item.title }}
    </VButton>
  </VPopover>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core';
import { reactive, ref, shallowRef, watch } from 'vue';
import type { Placement } from './VPopover.vue';

type NullableItem = (Item | undefined | null | false)

const props = defineProps<{
  open?: boolean,
  placement?: Placement,
  anchorPosition?: { x: number, y: number },
  offset?: number,
  items: NullableItem[] | (() => NullableItem[]),
}>()

const activatorElement = ref<HTMLElement>()

const emit = defineEmits([ "update:open" ])
const open = useVModel(props, "open", emit, { passive: true })

const items = shallowRef<Item[]>([])

watch(open, (open) => {
  if (!open) return
  const _items = typeof props.items === "function"? props.items(): props.items
  items.value = _items.filter(item => !!item) as Item[]
})

const activatorProps = {
  onClick: (e: MouseEvent) => {
    open.value = true
    activatorElement.value = e.currentTarget as HTMLElement
  }
}

const onItemClick = (item: Item) => {
  if (item.onClick) {
    item.onClick()
    open.value = false
  }
  if (item.props?.to) {
    open.value = false
  }
}

</script>

<script lang="ts">
export type Item = {
  title?: string,
  onClick?: () => void,
  props?: Record<string, any>,
  children?: Item[],
}

export type NullableItem = (Item | undefined | null | false)

export const useContextMenu = <T extends Array<any>>(creator: (...args: T) => NullableItem[]) => {

  let target: HTMLElement | null = null
  const props = reactive({
    items: [] as NullableItem[],
    open: false,
    anchorPosition: { x: 0, y: 0 },
    "onUpdate:open": (value: boolean) => {
      if (value === false && target !== null) {
        target.removeAttribute("data-popover-target")
        target = null
      }
      props.open = value
    }
  })
  
  const open = (e: MouseEvent, ...args: T) => {
    e.preventDefault()
    props.items = creator(...args)
    props.anchorPosition = { x: e.clientX, y: e.clientY }
    props.open = true

    if (target !== null) {
      target.removeAttribute("data-popover-target")
      target = null
    }
    target = e.currentTarget as HTMLElement
    target.setAttribute("data-popover-target", "true")
  }

  return {
    props,
    open
  }
}

</script>

<style lang="sass">

.v-context-menu
  padding: 6px 0
  display: flex
  flex-direction: column

.v-context-menu__item
  height: 40px
  display: flex
  align-items: center
  background: none
  border: none
  outline: none
  cursor: pointer
  padding: 0 16px
  padding-right: 32px
  text-decoration: none
  min-width: 150px
  box-sizing: border-box
  color: var(--text-color)
  border-radius: 0
  text-align: start
  font-weight: 500
  justify-content: flex-start

  &:hover, &.hover
    background-color: var(--hover-color)

</style>