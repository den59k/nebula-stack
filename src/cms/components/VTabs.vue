<template>
  <VScrollable ref="tabsRef" class="v-tabs">
    <TransitionGroup>
      <button v-for="item in props.items" :key="item.id" class="v-tabs__tab" @click="model = item.id">
        <slot name="content" :item="item">
          {{ item.title }}
        </slot>
      </button>
    </TransitionGroup>
    <div class="v-tabs__marker" :style="markerStyle"></div>
  </VScrollable>
</template>

<script lang="ts" setup generic="K extends number | string">
import { useVModel } from '@vueuse/core';
import { CSSProperties, Ref, onMounted, ref, watch } from 'vue';
import type { VScrollableRef } from './VScrollable.vue';

type Item =  { id: K, title: string }
const props = defineProps<{ items: Item[], modelValue?: K }>()
const emit = defineEmits([ "update:modelValue" ])

const model = useVModel(props, "modelValue", emit, { passive: true }) as Ref<K>

watch(() => props.items, (items) => {
  if ((model.value === undefined || model.value === null) && items.length > 0) {
    model.value = items[0].id
  }
}, { immediate: true })

const tabsRef = ref<VScrollableRef>()
const markerStyle = ref<CSSProperties>({})

const placeMarker = () => {
  const id = model.value
  if (!tabsRef.value) return
  const index = props.items.findIndex(item => item.id === id)
  if (index < 0) {
    markerStyle.value = { width: "0px" }
    return
  }
  const child = tabsRef.value.contentRef.children[index] as HTMLElement
  
  const p = 8
  markerStyle.value = { left: child.offsetLeft+p+"px", width: child.clientWidth-p*2+"px" }

  for (let child of tabsRef.value.contentRef.children) {
    const item = child as HTMLElement
    item.style.left = item.offsetLeft + "px"
  }

  setTimeout(() => {
    tabsRef.value!.scrollTo(child.offsetLeft-60, child.offsetLeft + child.clientWidth+60)
  }, 0)
}

onMounted(() => {
  placeMarker()
})
watch(() => props.items, () => {
  placeMarker()
}, { deep: true, flush: "post" })
// useResizeObserver(tabsRef, () => {
//   placeMarker()
// })

watch(model, placeMarker, { flush: "post" })

</script>

<style lang="sass">
.v-tabs
  border-bottom: 1px solid rgba(255, 255, 255, 0.1)
  overflow: hidden
  white-space: nowrap

  .v-scrollable__content
    position: relative
    gap: 8px
    display: flex

.v-tabs__tab
  background: none
  color: var(--text-color)
  height: 36px
  padding: 0 12px
  font-size: 14px
  border: none
  font-weight: 500
  display: flex
  align-items: center
  gap: 8px

  &.v-enter-active, &.v-leave-active
    transition: transform 0.225s cubic-bezier(0, 0, 0.2, 1), opacity 0.225s

  &.v-enter-from, &.v-leave-to
    transform: translateY(-20px)
    opacity: 0

  &.v-leave-active
    position: absolute

.v-tabs__marker
  position: absolute
  bottom: -1px
  height: 2px 
  background-color: var(--primary-color)
  border-radius: 1px
  transition: left 0.225s cubic-bezier(0.4, 0, 0.2, 1), width 0.225s cubic-bezier(0.4, 0, 0.2, 1)

</style>