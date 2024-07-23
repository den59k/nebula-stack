<template>
  <VFormControl v-bind="pickProps(props)" :error="error" class="v-input" :class="{ large, multiline }" outline>
    <slot name="start-adornment"></slot>
    <div v-if="type === 'phone'" class="v-input__start-adornment">+7</div>
    <textarea 
      v-if="props.multiline" 
      ref="inputRef" 
      v-model="model" 
      :placeholder="props.placeholder" 
      :rows="props.rows" 
      class="scroll"
      :name="props.name"
    ></textarea>
    <input 
      v-else 
      ref="inputRef" 
      v-model="model" 
      :placeholder="props.placeholder" 
      :type="inputType"
      :name="props.name"
    />
    <div v-if="props.maxLength" class="v-input__max-length">{{ model.length }} / {{ props.maxLength }}</div>
    <slot name="end-adornment"></slot>
  </VFormControl>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from 'vue';
import { VFormControlProps, pickProps } from './VFormControl.vue';
import { useTextareaAutosize } from '@vueuse/core';

const props = defineProps<{ 
  modelValue?: string | number | null,
  multiline?: boolean, 
  autofocus?: boolean,
  rows?: number, 
  placeholder?: string, 
  type?: "phone" | "number" | "integer" | "password", 
  name?: string,
  large?: boolean,
  maxLength?: number,
  validator?: (inputValue: string) => null | any
} & VFormControlProps>()

const emit = defineEmits(["update:modelValue"])

const parse = (value: string) => {
  if (props.validator) {
    return props.validator(value)
  }
  if (props.type === "number") {
    const val = parseFloat(value)
    if (isNaN(val)) return null
    return val
  }
  if (props.type === "integer") {
    const val = parseInt(value)
    if (isNaN(val)) return null
    return val
  }
  return value
}

let lastValue: number | null | string = ""

const model = ref("")
watch(() => props.modelValue, (value) => {
  if (value === lastValue) return
  model.value = (value ?? "").toString()
}, { immediate: true })

watch(() => model.value, (modelValue) => {
  const val = parse(modelValue)
  lastValue = val
  emit("update:modelValue", val)
})

const error = computed(() => {
  if ((props.type === "number" || props.type === "integer") && model.value && props.modelValue === null) {
    return { message: "Введите числовое значение" }
  }
  return props.error
})

const inputType = computed(() => {
  if (props.type !== "phone" && props.type !== "number" && props.type !== "integer") return props.type
  return undefined
})

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()
onMounted(() => {
  if (props.autofocus || props.error) {
    inputRef.value?.focus()
  }
})

if (props.multiline) {
  useTextareaAutosize({ element: inputRef as Ref<HTMLTextAreaElement>, input: model })
}
</script>

<style lang="sass">

.v-input
  min-width: 120px
  .v-form-control__outline
    height: 40px
    &>svg
      align-self: center
      color: #CED4DA

  input, textarea
    height: 100%
    flex-grow: 1
    background: none
    border: none
    padding: 0 14px
    outline: none
    position: relative
    z-index: 1
    width: 20px
    color: var(--text-color)
    font-size: 13px

    &::placeholder
      color: var(--placeholder-color)

  input
    padding-right: 4px

  &.multiline
    .v-form-control__outline
      height: auto

    textarea
      box-sizing: border-box
      line-height: 1.4em
      padding: 10px 14px
      resize: none
      min-height: 60px

.v-input__start-adornment
  width: 46px
  border-right: 1px solid #CED4DA
  display: flex
  align-items: center
  justify-content: center

  @media(max-width: 800px)
    width: 32px

.v-input__max-length
  position: absolute
  bottom: 2px
  right: 10px
  font-size: 12px
  color: #C8CCD0

.v-input.large .v-form-control__label
  font-size: 14px

.v-input.large .v-input__input-wrapper
  font-size: 14px
  height: 50px
  border-radius: 16px
  
  input
    padding: 0 20px

  @media(max-width: 800px)
    height: 38px
    font-size: 13px

</style>