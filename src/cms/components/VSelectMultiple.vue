<template>
  <VFormControl outline class="v-select" :label="props.label" :error="props.error" :required="props.required">
    <VPopover v-model:open="opened" placement="bottom" fit-anchor :offset="8">
      <template #activator="{ props: activatorProps }">
        <button class="v-select__activator multiple" :class="{ opened }" v-bind="activatorProps">
          <template v-if="model.length > 0">
            <div v-for="itemId in model" class="v-select__tag">
              {{ itemsMap.get(itemId)?.title }}
              <VIconButton icon="close" @mousedown.stop @click="deleteItem(itemId)"/>
            </div>
          </template>
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
  </VFormControl>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core';
import { Ref, computed, ref } from 'vue';
import type { VFormControlProps } from './VFormControl.vue';

const props = defineProps<{ items: Item[], modelValue?: Array<string | number>, placeholder?: string } & VFormControlProps>()
const emit = defineEmits([ "update:modelValue" ])

const model = useVModel(props, "modelValue", emit, { passive: true, defaultValue: [] }) as Ref<Array<string | number>>

const itemsMap = computed(() => new Map(props.items.map(item => [ item.id, item ])))

const opened = ref(false)
const onItemClick = (item: Item) => {
  if (!model.value.includes(item.id)) {
    model.value.push(item.id)
  }
  opened.value = false
}

const deleteItem = (itemId: Item["id"]) => {
  const index = model.value.indexOf(itemId)
  if (index >= 0) {
    model.value.splice(index, 1)
  }
}

</script>

<script lang="ts">
export type Item = { id: string | number, title: string }

</script>

<style lang="sass">
.v-select__activator.multiple
  gap: 8px
  &>svg
    margin-left: auto
  .v-select__tag
    background-color: var(--background-color)
    flex: 0 0 auto
    padding: 0 10px
    height: 28px
    display: flex
    align-items: center
    border-radius: 4px
    gap: 2px

    &:first-child
      margin-left: -8px

    .v-icon-button
      width: 24px
      height: 24px
      padding: 0
      margin-right: -6px
      svg
        width: 16px
        height: 16px

</style>