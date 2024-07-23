<template>
  <VCard content:class="form-column">
    <template #header>
      <VIconButton component="router-link" to="/tables" icon="arrow-left" class="mr-2 ml-n2" />
      Схема данных {{ currentTable?.name }}
      <VButton v-if="currentTable" @click="apply">Сохранить изменения</VButton>
    </template>
    <div class="form-row">
      <VInput v-bind="register('title')" label="Название таблицы" placeholder="Введите название таблицы"/>
    </div>
  </VCard>
  <VCard class="mt-4" :class="{ disabled: !currentTable }">
    <template #header>
      <VTabs v-model="currentTab" class="ml-n4" :items="tabs" />
    </template>
    <template v-if="currentTable">
      <TableViewEditor v-if="currentTab === 'view'" v-model="views[0].columns" class="table-editor__workarea" :fields="currentTable.fields"/>
      <template v-else>
        <FormEditor class="table-editor__workarea mt-0" v-model="forms[0].fields" :fields="currentTable.fields"/>
      </template>
    </template>
  </VCard>
</template>

<script lang="ts" setup>
import { useForm, useRequestWatch } from 'vuesix';
import { tablesApi } from '../api/tablesApi';
import { ref, watch } from 'vue';
import TableViewEditor from '../components/TableViewEditor/TableViewEditor.vue'
import FormEditor from '../components/FormEditor/FormEditor.vue'
import { camelCaseToKebab } from '../utils/lang'
import { useRoute } from 'vue-router';
import { formsApi } from '../api/formsApi';
import { viewsApi } from '../api/viewsApi';

const { register, values, handleSubmit, updateDefaultValues } = useForm({
  title: ""
})

const currentRoute = useRoute()

const { data: currentTable } = useRequestWatch(tablesApi.getSchema, () => currentRoute.params.tableName as string) as { data: any }

const forms = ref([{ fields: [], id: null as string | null }])
const views = ref([{ columns: [], id: null as string | null }])

watch(currentTable, (table) => {
  if (!table) return
  updateDefaultValues({ title: table.views[0]?.name ?? "" })
  forms.value = table.forms.length > 0? table.forms: [{ fields: [], id: null }]
  views.value = table.views.length > 0? table.views: [{ columns: [], id: null }]
}, { immediate: true })

const currentTab = ref("view")
const tabs = [
  { id: "view", title: "Отображение" },
  { id: "form", title: "Форма для создания" },
]

const apply = handleSubmit(async (values) => {  
  for (let view of views.value) {
    if (view.id !== null) {
      await viewsApi.updateView(view.id, { name: values.title, columns: view.columns })
    } else {
      await viewsApi.createView({ name: values.title, systemTable: currentTable.value.name, columns: view.columns })
    }
  }

  for (let form of forms.value) {
    if (form.id !== null) {
      await formsApi.updateForm(form.id, { fields: form.fields })
    } else {
      await formsApi.createForm({ 
        name: `Форма для создания ${values.title}`, 
        systemTable: currentTable.value.name,
        fields: form.fields,
        endpoint: camelCaseToKebab(currentTable.value.name)
      })
    }
  }
})

</script>

<style lang="sass">
.table-editor__columns-table
  .v-table__row, .v-table__header
    gap: 12px

    &:hover
      background: transparent

.table-editor__workarea
  margin-left: -24px
  margin-right: -24px
  margin-top: -12px
  margin-bottom: -20px
  min-height: 200px

.table-editor-page__tabs-settings
  width: 24px
  height: 24px
  margin-right: -4px
  opacity: 0.3
  &:hover
    opacity: 1

</style>