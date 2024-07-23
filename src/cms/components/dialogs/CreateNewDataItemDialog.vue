<template>
  <VDialog class="standart">
    <template #header>
      {{ props.item? "Редактирование": "Создание" }} объекта
    </template>
    <Form v-if="formData" v-model="data" :fields="formData.fields" />
    <template #actions>
      <VButton flat @click="dialogStore.back">Отмена</VButton>
      <VButton @click="apply">Сохранить</VButton>
    </template>
  </VDialog>
</template>

<script lang="ts" setup>
import { cloneDeep, useRequest } from 'vuesix';
import Form from '../Form/Form.vue'
import { useDialogStore } from '../../stores/dialogStore';
import { ref, watch } from 'vue';
import { request } from '../../api/request';
import { formsApi } from '../../api/formsApi';
import { traverseFormFields } from '../../utils/traverse';
import { utilsApi } from '../../api/utilsApi';

const props = defineProps<{ formId: string, onSave?: (values: any) => void, item?: any }>()
const { data: formData } = useRequest(formsApi.getForm, props.formId)
const data = ref(cloneDeep(props.item ?? {}))

const dialogStore = useDialogStore()

watch(() => formData.value, async () => {
  if (!formData.value) return
  const resp = await request(`/api${formData.value.endpoint}/${props.item[formData.value.idField ?? 'id']}`)
  data.value = resp
}, { immediate: true })

const apply = async () => {
  if (!formData.value) return

  const files: any[] = []
  traverseFormFields(formData.value.fields, (item) => {
    if (item.fileField && data.value[item.fileField]) {
      files.push(data.value[item.fileField])
    }
  })

  for (let file of files) {
    if (file.file) {
      const { id, src, previewSrc } = await utilsApi.uploadFile(file.file, { onProgress(progress) { file.progress = progress } })
      file.src = src
      file.previewSrc = previewSrc
      delete file.file
      data.value[file.fieldId] = id
    }
  }

  if (props.item) {
    await request(`/api${formData.value.endpoint}/${props.item[formData.value.idField ?? 'id']}`, data.value)
  } else {
    await request(`/api${formData.value.endpoint}`, data.value)
  }
  props.onSave?.(data.value)
  dialogStore.close()
}

</script>

<style lang="sass">

</style>