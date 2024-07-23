<template>
  <div class="v-dialog scroll" role="dialog">
    <div v-if="slots.header" class="v-dialog__header">
      <slot name="header"></slot>
      <VIconButton icon="close" class="close-icon" @click="dialogStore.close"></VIconButton>
    </div>
    <div class="v-dialog__content" :class="[props['content:class'], slots.actions? '': 'bottom-padding']" >
      <slot></slot>
    </div>
    <div v-if="slots.actions" class="v-dialog__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';
import { useDialogStore } from '../stores/dialogStore';

const slots = useSlots()

const props = defineProps<{ "content:class"?: string }>()

const dialogStore = useDialogStore()

</script>

<style lang="sass">
.v-dialog
  background-color: var(--paper-color)
  border-radius: 16px
  position: relative
  max-height: 86vh
  max-width: 94vw
  --padding: 0 24px

  &.standart
    width: 650px

  @media(max-width: 800px)
    position: fixed
    max-width: unset
    max-height: unset
    top: 0
    bottom: 0
    right: 0
    left: 0
    max-height: 100%
    max-width: 100%
    margin: 0
    border-radius: 0

    &.standart
      width: 100%

.v-dialog__header
  font-size: 16px
  font-weight: 700
  padding: var(--padding)
  display: flex
  align-items: center
  height: 60px
  border-bottom: 1px solid var(--border-color)
  position: relative
  width: 100%
  box-sizing: border-box
  gap: 8px

  .close-icon
    margin-right: -8px
    width: 32px
    height: 32px
    margin-left: auto
    
.v-dialog__content
  padding: var(--padding)
  padding-top: 16px
  padding-bottom: 8px

  &.bottom-padding
    padding-bottom: 16px

.v-dialog__actions
  padding: var(--padding)
  padding-top: 0
  display: flex
  justify-content: flex-end
  align-items: center
  height: 70px
  gap: 8px

</style>