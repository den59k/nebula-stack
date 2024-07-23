<template>
  <div class="form-editor-enum-values">
    <VCollapse :label="`Варианты выбора (${model.length})`" withPadding>
      <template v-for="item in model" >
        <div v-if="activeItem === item" class="form-editor-enum__item active">
          <VInput :disabled="!props.editable" v-model="activeItem.id" placeholder="Значение"/>
          <VInput v-model="activeItem.title" placeholder="Надпись"/>
          <VIconButton class="apply-button" icon="check" @click="activeItem = null"/>
        </div>
        <div v-else class="form-editor-enum__item" @click="activeItem = item">
          {{ item.id }} <span>{{ item.title }}</span> 
          <VIconButton v-if="props.editable" title="Удалить значение" class="delete-button" icon="close" @click.stop="deleteItem(item)"/>
        </div>
      </template>
      <button v-if="props.editable" class="form-editor-enum__add-button" @click="addItem">
        <div class="add-marker"><VIcon icon="add" /></div>
      </button>
    </VCollapse>
  </div>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core';
import { Ref, reactive, shallowRef } from 'vue';

type Item = { id: string, title: string }

const props = defineProps<{ modelValue?: Item[], editable?: boolean }>()
const emit = defineEmits([ "update:modelValue" ])

const model = useVModel(props, "modelValue", emit, { defaultValue: [], passive: true }) as Ref<Item[]>

const activeItem = shallowRef<Item | null>(null)

const addItem = () => {
  const newItem = reactive({ id: "", title: "" })
  model.value = [ ...model.value, newItem ]
  activeItem.value = newItem
}

const deleteItem = (item: Item) => {
  model.value = model.value.filter(_item => _item !== item)
}

</script>

<style lang="sass">
.form-editor-enum-values
  margin-top: -4px
  display: flex
  flex-direction: column

  .title
    font-size: 13px
    margin-bottom: 4px


.form-editor-enum__item
  height: 40px
  display: flex
  align-items: center
  font-size: 14px
  padding: 0 8px
  margin: 0 -8px
  border-radius: 8px
  flex-shrink: 0
  cursor: pointer
  &:hover
    background-color: rgba(255, 255, 255, 0.05)

    &.active
      background: none

  span
    margin-left: 8px
    color: var(--text-secondary-color)

  .delete-button
    margin-left: auto
    flex-shrink: 0
    color: var(--error-color)
    width: 24px
    height: 24px
    svg
      width: 16px
      height: 16px

  .apply-button
    color: var(--primary-color)
    width: 32px
    height: 32px
    margin-right: -4px

  &.active
    gap: 8px
    cursor: default

    .v-input
      min-width: 50px
      flex: 1 1 auto
      height: 32px
      input
        width: 50px
        padding: 0 10px

.form-editor-enum__add-button
  display: flex
  align-items: center
  justify-content: center
  padding: 0
  position: relative
  background: none
  border: none
  opacity: 0.5
  width: 100%

  &:hover
    opacity: 1
    
  &:after
    content: ""
    border-bottom: 2px solid var(--primary-color)
    top: calc(50% - 1px)
    position: absolute
    left: 0
    right: 0

  .add-marker
    display: flex
    align-items: center
    justify-content: center
    width: 24px
    height: 24px
    background-color: var(--primary-color)
    border-radius: 9999px
    position: relative
    z-index: 1

    svg
      width: 18px
      height: 18px

</style>