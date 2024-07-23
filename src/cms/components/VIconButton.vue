<template>
  <component :is="props.component ?? 'button'" class="v-icon-button" :class="{ secondary, small, flat, disabled }">
    <slot></slot>
    <VIcon v-if="props.icon" :icon="props.icon" />
  </component>
</template>

<script lang="ts" setup>

const props = defineProps<{
  secondary?: boolean,
  small?: boolean,
  flat?: boolean,
  icon?: string,
  component?: string,
  disabled?: boolean
}>()
</script>

<style lang="sass">
.v-icon-button
  width: 40px
  height: 40px
  border-radius: 9999px
  display: flex
  align-items: center
  justify-content: center
  background: none
  flex-shrink: 0
  padding: 0
  border: 1px solid var(--border-dark-color)
  color: var(--text-color)

  svg
    pointer-events: none

  &:focus-visible
    box-shadow: 0px 0px 0px 2px #0D6EFD40

  &:hover
    background-color: var(--hover-color)

  &.secondary
    border: none
    background-color: var(--button-secondary)
    color: #000000

    &:hover
      background-color: var(--button-secondary-hover)
  
  &.small
    width: 26px
    height: 26px

  &.flat
    background-color: transparent
    border: none

    &:hover
      background-color: rgba(255, 255, 255, 0.05)

  &.disabled
    opacity: 0.5
    pointer-events: none

  @media(max-width: 800px)
    width: 40px
    height: 40px

</style>