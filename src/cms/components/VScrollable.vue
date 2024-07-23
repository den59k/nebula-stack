<template>
  <div ref="containerRef" class="v-scrollable" :class="{ hideArrows }">
    <VIconButton class="v-scrollable__left-button" icon="chevron-left" :disabled="left === 0" @click="scroll(-1)"/>
    <div class="v-scrollable__wrapper">
      <div ref="contentRef" class="v-scrollable__content" :class="[ props['class:content'], { transition }]" :style="{ left: -left+'px' }">
        <slot></slot>
      </div>
    </div>
    <VIconButton class="v-scrollable__right-button" icon="chevron-right" :disabled="left >= maxLeft" @click="scroll(1)"/>
  </div>
</template>

<script lang="ts" setup>
import { clamp, useResizeObserver } from '@vueuse/core';
import { ref } from 'vue';
import VIconButton from './VIconButton.vue';

const props = defineProps<{ "class:content"?: string }>()
const emit = defineEmits([ "resize" ])

const containerRef = ref<HTMLDivElement>()
const contentRef = ref<HTMLDivElement>()

const arrowSize = 32
const hideArrows = ref(true)

const maxLeft = ref(0)
const transition = ref(false)
const left = ref(0)

let transitionTimeout: ReturnType<typeof setTimeout> | null = null
const moveLeft = (newLeft: number) => {
  if (left.value === newLeft) return
  left.value = newLeft
  transition.value = true
  if (transitionTimeout !== null) clearTimeout(transitionTimeout)
  transitionTimeout = setTimeout(() => {
    transition.value = false
    transitionTimeout = null
  }, 225)
}

let fixedMin: number | null = null
let fixedMax: number | null = null

const calcSize = () => {
  if (!contentRef.value || !containerRef.value) return
  if (contentRef.value.clientWidth > containerRef.value.clientWidth-16) {
    const width = containerRef.value.clientWidth - arrowSize * 2
    maxLeft.value = contentRef.value.clientWidth - width

    let newLeft = left.value
    if (fixedMin !== null && newLeft > fixedMin) {
      newLeft = fixedMin
    }
    if (fixedMax !== null && newLeft < fixedMax-width) {
      newLeft = fixedMax-width
    }
    newLeft = clamp(newLeft, 0, maxLeft.value)

    left.value = newLeft
    hideArrows.value = false
  } else {
    hideArrows.value = true
    maxLeft.value = 0

    moveLeft(0)
  }
}

useResizeObserver(containerRef, calcSize)
useResizeObserver(contentRef, calcSize)

const scroll = (offset: number) => {
  moveLeft(clamp(left.value + offset * 100, 0, maxLeft.value))
  fixedMin = null
  fixedMax = null
}

const scrollTo = (min: number, max?: number) => {
  fixedMin = min
  fixedMax = max ?? min


  if (!containerRef.value || hideArrows.value) return
  let newLeft = left.value

  if (newLeft > fixedMin) {
    newLeft = min
  }
  const width = containerRef.value.clientWidth - arrowSize * 2
  if (newLeft < fixedMax-width) {
    newLeft = fixedMax-width
  }

  newLeft = clamp(newLeft, 0, maxLeft.value)
  moveLeft(newLeft)
}

defineExpose({
  containerRef,
  contentRef,
  scrollTo
})

</script>

<script lang="ts">

export type VScrollableRef = {
  containerRef: HTMLDivElement,
  contentRef: HTMLDivElement,
  scrollTo: (min: number, max?: number) => void
}

</script>

<style lang="sass">
.v-scrollable
  display: flex
  align-items: stretch
  overflow: hidden
  padding: 0 32px
  position: relative
  transition: padding 0.2s cubic-bezier(0.4, 0, 0.2, 1)

  &.hideArrows
    position: relative
    padding: 0 8px
    &>.v-icon-button
      display: none

.v-scrollable__left-button, .v-scrollable__right-button
  align-self: center
  width: 32px
  height: 32px
  position: relative
  z-index: 10
  position: absolute

.v-scrollable__left-button
  left: 0

.v-scrollable__right-button
  right: 0

.v-scrollable__wrapper
  overflow: hidden
  position: relative
  width: 100%

.v-scrollable__content
  position: absolute
  left: 0
  width: max-content
  &.transition
    transition: left 0.22s cubic-bezier(0.4, 0, 0.2, 1)
</style>