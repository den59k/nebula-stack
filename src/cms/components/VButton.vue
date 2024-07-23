<template>
  <component :is="component" v-bind="bind" class="v-button" :class="{ disabled, flat, outline, large }">
    <slot></slot>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ disabled?: boolean, flat?: boolean, outline?: boolean, large?: boolean, to?: string, blank?: boolean }>()

const isUrl = computed(() => {
  if (!props.to) return false
  if (props.blank) return true
  return props.to.startsWith('http') || props.to.startsWith('blob')
})

const component = computed(() => {
  if (props.to && isUrl.value) {
    return 'a'
  }
  if (props.to) {
    return 'router-link'
  }
  return 'button'
})

const bind = computed(() => {
  if (isUrl.value) {
    return {
      href: props.to,
      target: '_blank'
    }
  }
  return {
    to: props.to
  }
})

</script>

<style lang="sass">

.v-button
  background-color: var(--primary-color)
  height: 36px
  color: white
  font-weight: 600
  border-radius: 20px
  font-size: 13px
  padding: 0 28px
  text-decoration: none
  display: flex
  justify-content: center
  align-items: center
  border: none
  gap: 6px

  &:hover
    background-color: var(--primary-color-hover)
    
  &:active 
    background-color: var(--primary-color-active)

  &.disabled
    opacity: 0.5
    pointer-events: none

  &.flat
    background: none
    color: var(--primary-color)

    &:hover
      background-color: rgba(#0073E9, 0.08)

  &.outline
    background: none
    border: 1px solid var(--primary-color)
    color: var(--primary-color)

    &:hover
      border-color: var(--primary-color-hover)
      color: var(--primary-color-hover)

    &:active
      border-color: var(--primary-color-active)
      color: var(--primary-color-active)
      
  &.large
    height: 50px
    font-size: 14px
    border-radius: 16px
    padding: 0 32px
    font-weight: 600

  &:focus-visible
    box-shadow: 0 0 0 4px #0D6EFD40
  
  &.color-red.outline
    border-color: var(--error-color)
    color: var(--error-color)


</style>