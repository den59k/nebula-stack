<template>
  <div v-if="props.item.children" :data-field-id="index" class="form-row">
    <FormEditorItem 
      v-for="child in props.item.children" 
      :item="child"
      :fieldsMap="fieldsMap"
      @delete-item="emit('deleteItem', $event, props.item)"
      @setActiveItem="emit('setActiveItem', $event)"
    />
  </div>
  <component :is="component" 
    v-else
    v-bind="additionalProps"
    :label="props.item.name" 
    :data-field-id="index" 
    :placeholder="props.item.placeholder" 
    @click="emit('setActiveItem', props.item)"
  >
    <template #end-adornment>
      <VIconButton 
        icon="delete" 
        class="form-editor__delete-icon" 
        title="Удалить поле" 
        @click.stop="emit('deleteItem', props.item)"
      />
    </template>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Field } from './FormEditor.vue';
import { FormItem } from '../../api/formsApi';

const props = defineProps<{ item: FormItem, index?: number, fieldsMap: Map<string, Field> }>()

const emit = defineEmits([ "deleteItem", "setActiveItem" ])

const getInputType = (item: FormItem) => {
  if (item.format === "password") return "password"
  if (item.format === "")
  return undefined
}

const component = computed(() => {
  if (props.item.format === 'select') return "VSelect"
  if (props.item.format === "file" || props.item.format === "files-group") return "VFileUploader"
  return "VInput"
})

const additionalProps = computed(() => {
  if (props.item.format === 'select') {
    return { 
      items: props.item.enum ?? [] 
    }
  }
  if (props.item.format === 'file' || props.item.format === "files-group") {
    return {
      multiple: props.item.format === "files-group"
    }
  }
  return { 
    multiline: props.item.format === 'multiline', 
    type: getInputType(props.item) 
  }
})

</script>

<style lang="sass">

</style>