<template>
  <svg class="v-spinner" :width="halfSize*2" :height="halfSize*2" fill="none">
    <circle 
      :cx="halfSize" 
      :cy="halfSize" 
      :r="radius" 
      stroke="currentColor" 
      :stroke-width="props.width ?? 3" 
      :stroke-dashoffset="(1 - progress) * l" 
      :stroke-dasharray="l"
      :transform="`rotate(-90, ${halfSize}, ${halfSize})`"
      class="v-spinner__primary"
    ></circle>
    <circle 
      :cx="halfSize" 
      :cy="halfSize" 
      :r="radius"
      stroke="rgba(255, 255, 255, 0.13)"
      :stroke-width="props.width ?? 3"
      :stroke-dashoffset="-progress * l" 
      :stroke-dasharray="l"
      :transform="`rotate(-90, ${halfSize}, ${halfSize})`"
      class="v-spinner__shadow"
    ></circle>
  </svg>
</template>

<script lang="ts" setup>
import { clamp } from '@vueuse/core';
import { computed } from 'vue';

const props = defineProps<{ radius?: number, progress: number | undefined, width?: number }>()

const radius = computed(() => props.radius || 10)
const l = computed(() => radius.value * Math.PI * 2)
const halfSize = computed(() => radius.value + (props.width ?? 3))

const progress = computed(() => {
  return Math.round(clamp((props.progress ?? 0), 0, 100)) / 100
})

</script>

<style lang="sass">
.v-spinner
  circle
    transition: stroke-dashoffset 0.2s cubic-bezier(0, 0, 0.2, 1)
.v-spinner__primary
  stroke: var(--primary-color)
.v-spinner__shadow
  stroke: rgba(0, 0, 0, 0.4)
</style>