<template>
  <Teleport to="body">
    <Transition>
      <div v-if="dialogStore.length > 0" class="v-dialog-backdrop" @mousedown="onMouseDown" @mouseup="onMouseUp">
        <component 
          v-for="(dialog, index) in dialogStore.dialogHistory" 
          v-show="index === dialogStore.length-1" 
          :is="dialog.dialog" 
          v-bind="dialog.props"
        >

        </component>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { useDialogStore } from '../stores/dialogStore';
import { useKeyDownStore } from '../stores/keydownStore';
import { watch } from 'vue';

const dialogStore = useDialogStore()

useKeyDownStore().watch("Escape", () => dialogStore.length > 0, () => dialogStore.back())

let mouseDown = false
const onMouseDown = (e: MouseEvent) => {
  mouseDown = e.target === e.currentTarget
}
const onMouseUp = (e: MouseEvent) => {
  if (!mouseDown || e.target !== e.currentTarget) {
    mouseDown = false
    return
  }
  dialogStore.back()
}

useKeyDownStore().watch("Escape", () => dialogStore.length > 0, () => {
  dialogStore.back()
})

watch(() => dialogStore.length > 0, (value) => {
  if (value) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflowY = "hidden"
    document.body.style.paddingRight = scrollbarWidth+"px"
    document.getElementById("app")?.setAttribute("inert", "")
  } else {
    document.body.style.paddingRight = ""
    document.body.style.overflowY = "auto"
    document.getElementById("app")?.removeAttribute("inert")
  }
})

</script>

<style lang="sass">
.v-dialog-backdrop
  position: fixed
  top: 0
  bottom: 0
  right: 0
  left: 0
  background-color: rgba(0, 0, 0, 0.75)
  display: flex
  align-items: center
  justify-content: center
  z-index: 900

  &.v-enter-active, &.v-leave-active 
    transition: opacity 0.14s ease
    .v-dialog
      transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1)

  &.v-enter-from, &.v-leave-to 
    opacity: 0

    .v-dialog
      transform: scale(0.8)

</style>