<template>
  <component :is="props.tag ?? 'div'" class="v-card" :class="{ compact, collapse }">
    <div v-if="slots.header" class="v-card__header" :class="props['header:class']" @click="showContent = !showContent">
      <slot name="header"></slot>
    </div>
    <div v-if="!props.collapse || showContent" class="v-card__content" :class="props['content:class']">
      <slot></slot>
    </div>
    
  </component>
</template>

<script lang="ts" setup>
import { ref, useSlots } from 'vue';

const props = defineProps<{ 
  tag?: string, 
  "header:class"?: string, 
  "content:class"?: string, 
  collapse?: boolean,
  compact?: boolean 
}>()

const slots = useSlots()

const showContent = ref(false)

</script>

<style lang="sass">

.v-card
  border: 1px solid var(--border-color)
  background-color: var(--paper-color)
  min-height: 50px
  display: flex
  flex-direction: column
  border-radius: 8px
  flex-shrink: 0

  h5
    font-size: 16px
    margin: 0

  &.disabled
    opacity: 0.6
    pointer-events: none

  &.collapse 
    .v-card__header
      cursor: pointer
      border-bottom: none
    .v-card__content
      border-top: 1px solid var(--border-color)

.v-card__header
  height: 64px
  border-bottom: 1px solid var(--border-color)
  display: flex
  align-items: center
  flex-shrink: 0
  font-weight: 600
  padding-right: 40px
  gap: 16px

  .v-input, .v-button
    height: 38px

.v-card__content
  padding-top: 12px
  padding-bottom: 20px

.v-card.compact .v-card__content
  padding-bottom: 12px

.v-card__header, .v-card__content
  padding-left: 24px
  padding-right: 24px

.v-card__group-title
  font-weight: 600
  font-size: 15px
  color: var(--text-secondary-color)

</style>