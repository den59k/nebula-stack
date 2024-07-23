<template>
  <VFormControl v-bind="pickProps(props)" outline class="v-select" >
    <VPopover v-model:open="opened" placement="bottom" fit-anchor :offset="8">
      <template #activator="{ props: activatorProps }">
        <button class="v-select__activator" :class="{ opened }" v-bind="activatorProps">
          <div v-if="currentItem">{{ currentItem.title }}</div>
          <div v-else class="v-select__placeholder">{{ props.placeholder ?? 'Выберите значение' }}</div>
          <VIcon icon="v-select-arrow" />
        </button>
      </template>
      <div class="v-select__menu">
        <button v-for="item in items" :key="item.id" @click="onItemClick(item)" >
          <slot name="item" :item="item">
            {{ item.title }}
          </slot>
        </button>
      </div>
    </VPopover>
    <slot name="end-adornment"></slot>
  </VFormControl>
</template>

<script lang="ts" setup>
import { Ref, computed, ref } from 'vue';
import { VFormControlProps, pickProps } from './VFormControl.vue';
import { useVModel } from '@vueuse/core';

type Item = { id: string | number, title: string }

const props = defineProps<{ items: Item[], modelValue?: string | number | null, placeholder?: string } & VFormControlProps>()
const emit = defineEmits([ "update:modelValue" ])

const model = useVModel(props, "modelValue", emit, { passive: true, defaultValue: null }) as Ref<string | number | null>

const currentItem = computed(() => {
  if (model.value === null) return null
  return props.items.find(item => item.id === model.value) ?? null
})

const items = computed(() => {
  return props.items
})

const opened = ref(false)
const onItemClick = (item: Item) => {
  model.value = item.id
  opened.value = false
}

</script>

<style lang="sass">
.v-select
  .v-form-control__outline
    height: 40px

.v-select__placeholder
  color: var(--text-secondary-color)

.v-select__activator
  background: none
  border: none
  display: flex
  align-items: center
  padding: 0 16px
  width: 100%
  color: var(--text-color)
  text-align: left
  &>div
    flex: 1 1 auto

  &>svg
    margin-right: -6px
    color: var(--text-secondary-color)

  &.opened
    &>svg
      transform: rotate(180deg)

.v-select__menu
  display: flex
  flex-direction: column
  padding: 6px 0

  &>button
    background: none
    border: none
    color: var(--text-color)
    height: 40px
    display: flex
    align-items: center
    padding: 0 16px

    &:hover
      background-color: var(--hover-color)

</style>