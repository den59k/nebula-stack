<template>
  <VCard>
    <template #header>
      <VIconButton component="router-link" to="/views" icon="arrow-left" class="ml-n2 mr-n2" />
      {{ viewId === null? "Создание": "Редактирование"}} отображения
      <VButton v-if="hasChange" @click="apply">Сохранить</VButton>
    </template>
    <div class="form-row">
      <VInput v-bind="register('name')" label="Название отображения"/>
      <VSelect v-bind="register('systemTable')" label="Системная таблица" :items="tablesItems"/>
    </div>
  </VCard>
  <VCard class="mt-4">
    <template #header>Использование в системе</template>
    <div class="form-row">
      <VSelect v-bind="register('showInAdmin')" :items="showInAdminItems" label="Отображать в админ-панели"/>
      <VSelect v-bind="register('showInAdminForm')" :items="formItems" label="Форма для создания и редактирования объекта" 
        :disabled="values.showInAdmin === 'none' || values.showInAdmin === 'show'"/>
    </div>
  </VCard>
  <VCard v-if="currentTable" class="mt-4">
    <template #header>Поля отображения</template>
    <TableViewEditor  v-model="values.columns" class="view-item-page__workarea" :fields="currentTable.fields"/>
  </VCard>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parseItemId } from '../utils/parseItemId';
import { mutateRequest, useForm, useRequest } from 'vuesix';
import { tablesApi } from '../api/tablesApi';
import TableViewEditor from '../components/TableViewEditor/TableViewEditor.vue';
import { viewsApi } from '../api/viewsApi';
import { formsApi } from '../api/formsApi';
import { accountApi } from '../api/accountApi';

const currentRoute = useRoute()
const viewId = computed(() => parseItemId(currentRoute.params.viewId))

const { register, values, updateDefaultValues, hasChange, handleSubmit } = useForm({
  name: "",
  systemTable: null as string | null,
  columns: [],
  showInAdmin: "none",
  showInAdminForm: null as string | null,
}, { required: [ "name", "systemTable" ]})

const { data: tablesData } = useRequest(tablesApi.getTablesSchema)
const tablesItems = computed(() => {
  if (!tablesData.value) return []
  return tablesData.value.tables.map((item: any) => ({ id: item.name, title: item.name }))
})

watch(viewId, async (viewId) => {
  if (viewId === null) {
    updateDefaultValues({ name: "", systemTable: null, columns: [] })
    return
  }
  const values = await viewsApi.getView(viewId)
  updateDefaultValues(values)
}, { immediate: true })

const currentTable = computed(() => {
  if (!values.systemTable || !tablesData.value) return null
  return tablesData.value.tables.find((item: any) => item.name === values.systemTable) ?? null
})

const { data: forms } = useRequest(formsApi.getAll)
const formItems = computed(() => (forms.value ?? [])
  .filter(item => item.systemTable === values.systemTable)
  .map(item => ({ id: item.id, title: item.name })))
  
const showInAdminItems = computed(() => {
  const arr = [
    { id: "none", title: "Не отображать" },
    { id: "show", title: "Только просмотр" },
    { id: "showEdit", title: "Просмотр и редактирование" },
    { id: "showEditDelete", title: "Просмотр, редактирование и удаление" }
  ]
  return arr
})

watch([() => values.systemTable, () => forms.value], () => {
  if (values.showInAdminForm !== null) return
  values.showInAdminForm = formItems.value[0]?.id ?? null
}, { immediate: true })

const router = useRouter()
const apply = handleSubmit(async (values) => {
  if (viewId.value !== null) {
    await viewsApi.updateView(viewId.value, values)
  } else {
    const item = await viewsApi.createView(values)
    router.push(`/views/${item.id}`)
  }
  mutateRequest(viewsApi.getAll)
  mutateRequest(accountApi.getSidebarItems)
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