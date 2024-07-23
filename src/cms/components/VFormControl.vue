<template>
  <div class="v-form-control" :class="{ error: !!props.error, disabled }">
    <label v-if="!!props.label" class="v-form-control__label">
      {{ props.label }}<span v-if="props.required" class="v-form-control__required-marker">*</span>
    </label>
    <div v-if="props.outline" class="v-form-control__outline">
      <slot></slot>
    </div>
    <slot v-else></slot>
    <Transition>
      <div v-if="!!props.error" class="v-form-control__error">
        {{ error }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">

export type VFormControlProps = {
  error?: { message?: string, code?: string },
  label?: string
  required?: boolean
  disabled?: boolean
}

export const pickProps = (props: VFormControlProps) => {
  return { error: props.error, label: props.label, required: props.required, disabled: props.disabled }
}

</script>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<VFormControlProps & { outline?: boolean }>()

const error = computed(() => {
  if (!props.error) return ""
  const code = props.error["code"]
  if (code) {
    return props.error.message ?? ""
  }
  return props.error.message ?? "Произошла ошибка"
})

</script>

<style lang="sass">

.v-form-control
  display: flex
  flex-direction: column
  align-items: stretch
  position: relative
  transition: padding-bottom 0.12s cubic-bezier(0.4, 0, 0.2, 1)

  &.error
    &:not(.disablePadding)
      padding-bottom: 16px

    .v-form-control__label
      color: var(--error-color)

    .v-form-control__outline
      border-color: var(--error-color)

  &.disabled
    opacity: 0.5
    pointer-events: none

.v-form-control__outline
  display: flex
  border: 1px solid var(--input-border-color)
  border-radius: 8px
  transition: border-color 0.12s
  font-size: 13px
  position: relative

  &:focus-within
    border-color: #AAAAAC

.v-form-control__label
  font-size: 13px
  margin-bottom: 4px
  white-space: nowrap
  font-weight: 500
  user-select: none

.v-form-control__required-marker
  color: var(--primary-color)
  user-select: none
  margin-left: 0.15em

.v-form-control__error
  position: absolute
  bottom: 0
  font-size: 12px
  color: var(--error-color)
  transition: opacity 0.12s, transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)

  &.v-enter-from, &.v-leave-to
    opacity: 0

.v-form-control.disablePadding .v-form-control__error
  bottom: -16px
  &.v-enter-from, &.v-leave-to
    transform: translateY(-16px)


</style>