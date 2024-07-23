<template>
  <div class="v-collapse">
    <slot name="activator" :props="{ onClick, open }">
      <div 
        class="v-collapse__activator" 
        :class="{ open }"
        @mousedown="onClick" 
        @mouseenter="onMouseEnter"
      >
        <VIcon icon="v-collapse-arrow" />
        <div>{{ props.label }}</div>
      </div>
    </slot>
    <div 
      class="v-collapse__content" 
      :class="{ 'v-transition': transition, withPadding: props.withPadding }" 
      :style="transition? { height: `${height}px` }: undefined"
    >
      <div v-if="transition || open" ref="innerRef" class="v-collapse__content-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEventListener } from '@vueuse/core';
import { nextTick, ref, watch } from 'vue';

const props = defineProps<{ open?: boolean, label?: string, withPadding?: boolean }>()
const emit = defineEmits([ "update:open" ])

const height = ref(0)

const open = ref(props.open ?? false)
const transition = ref(false)
const innerRef = ref<HTMLElement>()

let hideTimeout: ReturnType<typeof setTimeout> | null = null
const setOpen = async (value: boolean) => {
  open.value = value
  if (hideTimeout !== null) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  if (open.value === false && innerRef.value) {
    height.value = innerRef.value!.clientHeight
  }
  
  transition.value = true
  await nextTick()
  await new Promise(res => requestAnimationFrame(res))

  if (open.value) {
    height.value = innerRef.value!.clientHeight
  } else {
    height.value = 0
  }
  
  hideTimeout = setTimeout(() => {
    transition.value = false
  }, 200)

  setTimeout(() => mouseMove = true, 0)
  emit("update:open", open.value)
}

const onClick = async () => {
  setOpen(!open.value)
}
watch(() => props.open, (value) => {
  if (typeof value !== 'boolean' || open.value === value) return
  setOpen(value) 
})

let mouseMove = false
useEventListener("mousedown", () => mouseMove = false)

const onMouseEnter = (e: MouseEvent) => {
  if (e.buttons > 0 && !mouseMove && !document.body.classList.contains('mousedrag')) {
    mouseMove = true
    onClick()
  }
}

</script>

<style lang="sass">
.v-collapse
  -webkit-user-drag: none

.v-collapse__activator
  cursor: pointer
  user-select: none
  display: flex
  align-items: center
  gap: 4px
  height: 30px
  font-size: 14px

  svg
    margin-left: -4px
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)

  &.open
    svg
      transform: rotate(90deg)

.v-collapse__content
  overflow: hidden

  &.v-transition
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1)

  &.withPadding
    padding: 8px
    margin: -8px

</style>