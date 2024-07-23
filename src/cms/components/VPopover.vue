<template>
  <Teleport to="body">
    <Transition>
      <div 
        v-if="open"
        v-bind="$attrs"
        class="v-popover" 
        :class="[ isHorizontal? 'horizontal': 'vertical', props.fitAnchor && 'fit-anchor', props.class ]"
        :style="style"
        ref="popoverRef"
      >
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
  <slot name="activator" :props="activatorProps"></slot>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useEventListener, useResizeObserver, useVModel } from '@vueuse/core'
import { useKeyDownStore } from '../stores/keydownStore';
import { useMouseDownOutside } from 'vuesix/src/hooks/useClickOutside';

export type Placement = 
  "top-start" | "top" |  "top-end" |
  "right-start" | "right" | "right-end" |
  "bottom-start" | "bottom" | "bottom-end" |
  "left-start" | "left" | "left-end"

const props = defineProps<{ 
  open?: boolean, 
  element?: HTMLElement,
  placement: Placement,
  offset?: number,
  fitAnchor?: boolean,
  class?: string,
  anchorPosition?: { x: number, y: number }
}>()

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits([ "update:open" ])

const popoverRef = ref<HTMLDivElement>()
const position = ref<{ top: number, left: number, width?: number, height?: number }>({ top: 0, left: 0 })
const origin = ref("center")

const open = useVModel(props, "open", emit, { passive: true })
const activatorElement = ref<HTMLElement>()

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min
  if (value > max) return max
  return value
}

const calcPrimary = (pos: "start" | "end", start: number, end: number, size: number, min: number, max: number) => {
  const fitStart = start-size >= min
  const fitEnd = end + size <= max

  if ((!fitEnd || pos === "start") && fitStart) return start - size
  if ((!fitStart || pos === "end") && fitEnd)  return end
  return pos === "start"? min: (max-size)
}

const calcSub = (pos: string | undefined, start: number, end: number, size: number, min: number, max: number) => {
  if (pos === "start") return clamp(start, min, max-size)
  if (pos === "end") return clamp(end - size, min, max-size)

  return clamp((start+end)/2 - size/2, min, max-size)
}

const calcOrigin = (start: number, end: number, point: number) => {
  return clamp(Math.round((point-start) / (end-start) * 100), 0, 100) + "%"
}

const getRect = () => {
  if (props.anchorPosition) {
    return {
      top: props.anchorPosition.y, bottom: props.anchorPosition.y,
      left: props.anchorPosition.x, right: props.anchorPosition.x,
      width: 0, height: 0
    }
  }
  const element = props.element ?? activatorElement.value
  if (!element) return null
  return element.getBoundingClientRect()
}

const isHorizontal = computed(() => props.placement.startsWith("left") || props.placement.startsWith("right"))

const margin = 8
const calcPosition = () => {
  if (!popoverRef.value) return
  const rect = getRect()
  if (!rect) return

  const placement = props.placement.split("-")

  const offset = props.offset ?? 0
  const width = popoverRef.value.clientWidth
  const height = popoverRef.value.clientHeight

  if (placement[0] === "top" || placement[0] === "bottom") {
    const top = calcPrimary(placement[0] === "top"? "start": "end", rect.top-offset, rect.bottom+offset, height, margin, window.innerHeight - margin)
    if (props.fitAnchor) {
      position.value = { 
        top, 
        left: calcSub('start', rect.left, rect.right, rect.width, margin, window.innerWidth - margin),
        width: rect.width
      }
    } else {
      position.value = { top, left: calcSub(placement[1], rect.left, rect.right, width, margin, window.innerWidth - margin) }
    }
  } else {
    const left = calcPrimary(placement[0] === "left"? "start": "end", rect.left-offset, rect.right+offset, width, margin, window.innerWidth - margin)
    if (props.fitAnchor) {
      position.value = { 
        left, 
        top: calcSub('start', rect.top, rect.bottom, rect.height, margin, window.innerHeight - margin),
        height: rect.height
      }
    } else {
      position.value = { left, top: calcSub(placement[1], rect.top, rect.bottom, height, margin, window.innerHeight - margin) }
    }
  }
  origin.value = 
    calcOrigin(position.value.left, position.value.left + width, rect.left + rect.width/2) +
    calcOrigin(position.value.top, position.value.top + height, rect.top + rect.height/2)
}

watch([() => props.element, () => props.anchorPosition], () => {
  calcPosition()
})

useResizeObserver(popoverRef, calcPosition)
useEventListener(window, "resize", calcPosition)

const close = () => {
  open.value = false
}
const closeDelayed = () => {
  setTimeout(close, 0)
}

useKeyDownStore().watch("Escape", open, close)
useMouseDownOutside(open, closeDelayed, popoverRef)

watch(open, (open) => {
  if (!props.element) return
  if (open) {
    props.element.classList.add("popoverHover")
  } else {
    props.element.classList.remove("popoverHover")
  }
})

const activatorProps = {
  onmousedown: (e: MouseEvent) => {
    open.value = !open.value
    if (open.value) {
      activatorElement.value = e.currentTarget as HTMLElement
    }
  }
}

const style = computed(() => {
  return { 
    left: position.value.left + 'px', 
    top: position.value.top +'px', 
    width: position.value.width? (position.value.width + 'px'): undefined,
    height: position.value.height? (position.value.height + 'px'): undefined,
    transformOrigin: origin.value 
  }
})

</script>

<style lang="sass">
.v-popover
  position: fixed
  background-color: var(--popover-color)
  border: 1px solid var(--border-color)
  border-radius: 12px
  min-width: 40px
  min-height: 40px
  transform: none
  z-index: 1000
  box-sizing: border-box

  &.v-enter-active, &.v-leave-active 
    transition: opacity 0.12s, transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)

  &.v-enter-from, &.v-leave-to
    opacity: 0

    &.vertical
      transform: scale(0.8, 0.6)

      &.fit-anchor
        transform: scale(1, 0.6)

    &.horizontal
      transform: scale(0.6, 0.8)

      &.fit-anchor
        transform: scale(0.6, 1)

</style>