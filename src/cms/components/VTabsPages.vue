<template>
  <div class="v-tabs-pages">
    <Transition :name="transitionClass">
      <div :key="props.page" class="v-tabs-pages__page" :class="props['page:class']">
        <slot :name="props.page" />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, useSlots, watch } from 'vue';

const props = defineProps<{ page: string, "page:class"?: string }>()

const slots = useSlots()

const transitionClass = ref("slide-right")
watch(() => props.page, (value, lastValue) => {
  const keys = Object.keys(slots)
  if (keys.indexOf(value) > keys.indexOf(lastValue)) {
    transitionClass.value = "slide-left"
  } else {
    transitionClass.value = "slide-right"
  }
})

</script>

<style lang="sass">
.v-tabs-pages
  position: relative
  overflow: hidden
  min-height: 100px

.v-tabs-pages__page
  position: absolute
  inset: 0

  &.slide-left-enter-active, &.slide-left-leave-active, &.slide-right-enter-active, &.slide-right-leave-active
    transition: transform 0.225s cubic-bezier(0.8, 0, 0.2, 1)

  &.slide-left-enter-from, &.slide-right-leave-to
    transform: translateX(100%)

  &.slide-right-enter-from, &.slide-left-leave-to
    transform: translateX(-100%)


</style>