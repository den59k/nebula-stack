<template>
  <div v-if="props.item.children" class="form-row">
    <FormItem 
      v-for="child in props.item.children" 
      :model-value="modelValue"
      :item="child"
    />
  </div>
  <component 
    v-else
    :is="component" 
    v-model="model"
    :label="props.item.name" 
    :placeholder="props.item.placeholder" 
    v-bind="additionalProps"
  />
</template>

<script lang="ts" setup>
import { FormItem as FormItemType } from '../../api/formsApi';
import { computed, markRaw, ref, watch } from 'vue';

const props = defineProps<{ item: FormItemType, modelValue?: any }>()
const emit = defineEmits([ "update:modelValue" ])

const getInputType = (item: FormItemType) => {
  if (item.format === "password") return "password"
  if (item.format === "inputNumber") return "number"
  if (item.format === "")
  return undefined
}

const model = computed({
  get() {
    return props.modelValue[props.item.fieldId!]
  },
  set(newValue: string | number | null) {
    if (!props.modelValue || !props.item.fieldId) return
    props.modelValue[props.item.fieldId] = newValue
  }
})

const component = computed(() => {
  if (props.item.format === 'select') return "VSelect"
  if (props.item.format === "file") return "VFileUploader"
  return "VInput"
})

const additionalProps = computed(() => {
  if (props.item.format === 'select') return { items: props.item.enum ?? [] }
  if (props.item.format === 'file' && props.item.fileField) {
    const obj = props.modelValue[props.item.fileField!]
    return { 
      onLoadfile(file: File) { 
        props.modelValue[props.item.fileField!] = { 
          file: markRaw(file), 
          previewSrc: URL.createObjectURL(file), 
          fieldId: props.item.fieldId,
          progress: null
        }
      },
      onDeletefile() {
        delete props.modelValue[props.item.fileField!]
      },
      preview: obj?.previewSrc,
      progress: obj?.progress
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