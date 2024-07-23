<template>
  <VCard v-if="data" compact>
    <template #header>
      {{ data.view.name }}
      <VButton v-if="data.view.showInAdmin.includes('Edit') && data.view.showInAdminForm" @click="createNew">
        Создать объект
      </VButton>
    </template>
    <VTable :columns="columns" :data="data.data" clickable @itemclick="onItemClick" @itemcontext="contextMenu.open"/>
    <VContextMenu v-bind="contextMenu.props"/>
  </VCard>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { makeRequest, mutateRequest, useRequest, useRequestWatch } from 'vuesix';
import { accountApi } from '../api/accountApi';
import { computed } from 'vue';
import { useDialogStore } from '../stores/dialogStore';
import CreateNewDataItemDialog from '../components/dialogs/CreateNewDataItemDialog.vue'
import { useContextMenu } from '../components/VContextMenu.vue';
import ConfirmDialog from '../components/dialogs/ConfirmDialog.vue';
import { formsApi } from '../api/formsApi';
import { request } from '../api/request';

const route = useRoute()
const { data } = useRequestWatch(accountApi.getTableData, () => route.params.tableName as string)

const columns = computed(() => {
  if (!data.value) return {}
  return Object.fromEntries(data.value.view.columns.map((item: any) => [ 
    item.fieldId, 
    { title: item.name }
  ]))
})

const mutateData = () => mutateRequest(accountApi.getTableData, route.params.tableName as string)

const dialogStore = useDialogStore()
const createNew = () => {
  dialogStore.open(CreateNewDataItemDialog, { formId: data.value.view.showInAdminForm, onSave: mutateData })
}

const onItemClick = (item: any) => {
  dialogStore.open(CreateNewDataItemDialog, { item, formId: data.value.view.showInAdminForm, onSave: mutateData })
}


const contextMenu = useContextMenu((item) => [
  { title: "Удалить элемент", onClick() {
    if (!data.value.view.showInAdminForm) return
    dialogStore.open(ConfirmDialog, {
      title: "Удалить элемент?",
      text: "Отменить действие будет невозможно",
      confirmTitle: "Удалить",
      async onConfirm() {
        const form = await makeRequest(formsApi.getForm, data.value.view.showInAdminForm)
        await request(`/api${form.endpoint}/${item[form.idField ?? 'id']}`, {}, { method: "DELETE" })
        mutateData()
      }
    })
  } }
])

</script>

<style lang="sass">

</style>