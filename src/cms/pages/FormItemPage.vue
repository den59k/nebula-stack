<template>
  <VCard>
    <template #header>
      <VIconButton component="router-link" to="/forms" icon="arrow-left" class="ml-n2 mr-n2" />
      {{ formId === null? "Создание": "Редактирование"}} формы
      <VButton v-if="hasChange" @click="apply">Сохранить</VButton>
    </template>
    <div class="form-row">
      <VInput v-bind="register('name')" label="Название формы"/>
      <VSelect v-bind="register('systemTable')" label="Системная таблица" :items="tablesItems"/>
    </div>
  </VCard>
  <VCard class="mt-4" >
    <template #header>Настройки сервиса</template>
    <div class="form-column">
      <div class="form-row">
        <VInput v-bind="register('endpoint')" label="Эндпоинт"/>
        <VSelect v-bind="register('endpointType')" label="Тип эндпоинта" :items="endpointTypes"/>
      </div>
      <div class="form-row">
        <VSelectMultiple v-bind="register('hooks')" :items="hooks" label="Обработчик доступа"/>
        <VSelectMultiple v-bind="register('modifiers')" :items="modifiers" label="Модификатор данных"/>
        <VSelectMultiple v-bind="register('effects')" :items="effects" label="Пост-обработчик"/>
      </div>
    </div>
  </VCard>
  <VCard v-if="currentTable" class="mt-4">
    <template #header>Конструктор формы</template>
    <FormEditor v-model="values.fields" class="view-item-page__workarea" :fields="fields"/>
  </VCard>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parseItemId } from '../utils/parseItemId';
import { mutateRequest, useForm, useRequest } from 'vuesix';
import { tablesApi } from '../api/tablesApi';
import { formsApi } from '../api/formsApi';
import FormEditor from '../components/FormEditor/FormEditor.vue';
import { nebulaApi } from '../api/nebulaApi';
import { traverseFormFields } from '../utils/traverse';

const currentRoute = useRoute()
const formId = computed(() => parseItemId(currentRoute.params.formId))

const { register, values, updateDefaultValues, hasChange, handleSubmit } = useForm({
  name: "",
  endpoint: "",
  endpointType: null as string | null,
  systemTable: null as string | null,
  hooks: [] as string[],
  modifiers: [] as string[],
  effects: [] as string[],
  fields: [] as any[],
}, { required: [ "name", "systemTable" ]})

const { data: tablesData } = useRequest(tablesApi.getTablesSchema)
const tablesItems = computed(() => {
  if (!tablesData.value) return []
  return tablesData.value.tables.map((item: any) => ({ id: item.name, title: item.name }))
})

watch(formId, async (formId) => {
  if (formId === null) {
    updateDefaultValues({ name: "", systemTable: null, fields: [], hooks: [], modifiers: [] })
    return
  }
  const formValues = await formsApi.getForm(formId)
  updateDefaultValues(formValues)
}, { immediate: true })

const currentTable = computed(() => {
  if (!values.systemTable || !tablesData.value) return null
  return tablesData.value.tables.find((item: any) => item.name === values.systemTable) ?? null
})

const fields = computed(() => {
  if (!currentTable.value) return []
  return currentTable.value.fields.map(item => {
    if (item.kind === "enum") {
      const enumValues = tablesData.value!.enums.find(enumItem => enumItem.name === item.type)?.values.map(item => item.name)
      if (enumValues) {
        return { ...item, enum: enumValues }
      }
    }
    return item
  })
})

const endpointTypes = [
  { id: "create", title: "Создание объекта" },
  { id: "createEdit", title: "Создание и редактирование" },
  { id: "createEditDelete", title: "Создание, редактирование и удаление" }
]
const { data: _hooks } = useRequest(nebulaApi.getHooks)
const hooks = computed(() => _hooks.value?.hooks.map((item: any) => ({ id: item.name, title: item.name })) ?? [])
const modifiers = computed(() => _hooks.value?.modifiers.map((item: any) => ({ id: item.name, title: item.name })) ?? [])
const effects = computed(() => _hooks.value?.effects.map((item: any) => ({ id: item.name, title: item.name })) ?? [])

const router = useRouter()
const apply = handleSubmit(async (values) => {
  if (formId.value !== null) {
    await formsApi.updateForm(formId.value, values)
  } else {
    const item = await formsApi.createForm(values)
    router.push(`/forms/${item.id}`)
  }
  mutateRequest(formsApi.getAll)
  updateDefaultValues(values)
})

</script>

<style lang="sass">
.view-item-page__workarea
  margin-left: -24px
  margin-right: -24px
  margin-bottom: -20px
  margin-top: -12px
  min-height: 200px
</style>