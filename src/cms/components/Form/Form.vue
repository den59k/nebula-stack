<template>
  <div class="form-column">
    <FormItem v-for="item in props.fields" v-model="props.modelValue" :item="item" />
  </div>
</template>

<script lang="ts" setup>
import FormItem from './FormItem.vue'
import { FormItem as FormItemType } from '../../api/formsApi';

const props = defineProps<{ fields: FormItemType[], modelValue?: any }>()

</script>

<style lang="sass">

</style>