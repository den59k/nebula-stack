<template>
  <div ref="sliderRef" class="v-slider" @mousedown="onMouseDown">
    <slot></slot>
    <div class="v-slider__marker" :style="markerStyle">

    </div>
  </div>
</template>

<script lang="ts" setup>
import { clamp, useResizeObserver, useVModel } from '@vueuse/core';
import { CSSProperties, computed, ref } from 'vue';
import { handleMove } from 'vuesix';

const props = defineProps<{ modelValue?: number, max?: number }>()
const emit = defineEmits([ "update:modelValue" ])

const vModel = useVModel(props, "modelValue", emit, { passive: true })

const sliderRef = ref<HTMLDivElement>()
const activeArea = ref(1)
const offset = 8
useResizeObserver(sliderRef, ([ entry ]) => {
  const width = sliderRef.value!.offsetWidth
  activeArea.value = (width-offset*2)/width
})

const markerStyle = computed<CSSProperties>(() => {
  let value = vModel.value!
  if (props.max !== undefined) {
    value = value * (100/props.max)
  }
  return { left: `${(value * activeArea.value)}%` }
})

const onMouseDown = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const max = props.max ?? 100
  handleMove(e, {
    onMove({ pos }) {
      vModel.value = clamp((pos.x - offset)/(rect.width*activeArea.value), 0, 1) * max
    }
  })
}

</script>

<style lang="sass">

.v-slider
  // border: 1px solid var(--border-color)
  height: 10px
  position: relative
  border-radius: 8px
  box-sizing: border-box
  cursor: pointer
  
  .v-slider__marker
    position: absolute
    left: 0px
    width: 16px
    height: 16px
    background-color: white
    border-radius: 9999px
    top: -3px
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25)
    border: 1px solid var(--border-color)
    box-sizing: border-box

</style>