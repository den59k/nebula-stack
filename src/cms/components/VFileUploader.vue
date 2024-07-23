<template>
  <VFormControl v-bind="pickProps(props)" class="v-image-uploader" @drop="onDrop">
    <VIconButton v-if="props.preview" class="v-image-uploader__delete-button" icon="delete" @click="deleteImage" />
    <div class="v-form-control__outline v-image-uploader__drop-zone" :class="{ drag }" @dragover="onDragOver" @dragleave="onDragLeave">
      <template v-if="drag">
        <img :src="icon" height="28" alt="empty-file-icon" >
        <div class="text">
          Отпустите файл здесь
        </div>
      </template>
      <template v-else-if="props.preview && typeof props.preview === 'string'">
        <img :src="props.preview" class="v-file-uploader__preview" :class="{ temp: progress !== null }">
        <VSpinner v-if="(typeof progress === 'number')" :progress="progress" :radius="20" :width="4"/>
      </template>
      <template v-else>
        <slot :icon="icon" :openDialog="fileDialog.open">
          <img :src="icon" height="28" alt="empty-file-icon" >
          {{ props.placeholder ?? "Перетащите файл сюда" }}
          <VButton @click="fileDialog.open">Загрузить файл</VButton>
        </slot>
        </template>
      <slot name="end-adornment"></slot>
    </div>
  </VFormControl>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { VFormControlProps, pickProps } from './VFormControl.vue';
import { useFileDialog } from '@vueuse/core';
import lightIcon from '../assets/images/emptyFile.svg'
import darkIcon from '../assets/images/emptyFileDark.svg'

const props = defineProps<{ 
  modelValue?: string,
  accept?: string, 
  placeholder?: string,
  preview?: string,
  progress?: number | null
} & VFormControlProps>()
const emit = defineEmits([ "loadfile", "deletefile", "update:modelValue" ])

const addFile = async (file: File) => {
  emit("loadfile", file)
}

const drag = ref(false)
const onDragOver = (e: DragEvent) => {
  if (e.dataTransfer?.types?.[0]?.startsWith('text')) return
  e.preventDefault()
  drag.value = true
}

const onDragLeave = (e: DragEvent) => {
  drag.value = false
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  drag.value = false

  for (const item of (e as any).dataTransfer.items) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile() as File
    if (!file) continue

    addFile(file)
  }
}

const deleteImage = () => {
  emit("update:modelValue", null)
  emit("deletefile", null)
}

const fileDialog = useFileDialog({
  accept: props.accept ?? 'image/*',
  multiple: false
})

fileDialog.onChange((files) => {
  if (!files || files.length === 0) return
  for (const file of files) {
    addFile(file)
  }
  fileDialog.reset()
})

const icon = computed(() => {
  return (document.querySelector("html")?.classList.contains("dark-theme"))? darkIcon: lightIcon
})

</script>

<style lang="sass">

button.v-image-uploader__delete-button
  width: 24px
  height: 24px
  border: none
  position: absolute
  right: -2px
  top: -4px

  svg
    width: 16px
    height: 16px

.v-image-uploader__drop-zone
  height: 140px
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  text-align: center

  font-size: 12px
  gap: 6px
  color: #A3A3A3

  .v-button
    font-weight: 400

  &.drag
    background-image: none
    box-shadow: 0 0 0px 1px var(--primary-color)

    &>*
      pointer-events: none

  .v-spinner
    position: absolute

.v-file-uploader__preview
  height: 100%

  &.temp
    opacity: 0.6
</style>