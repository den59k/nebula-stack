<template>
  <VCard compact>
    <template #header>
      Формы
      <VButton to="/forms/new">Создать форму</VButton>
    </template>
    <VTable 
      v-if="data" 
      :columns="columns" 
      :data="data" 
      :to="item => `/forms/${item.id}`"
      @itemcontext="contextMenu.open"
    >
    </VTable>
    <VContextMenu v-bind="contextMenu.props"/>
  </VCard>
</template>

<script lang="ts" setup>
import { mutateRequest, useRequest } from 'vuesix';
import { Form, formsApi } from '../api/formsApi';
import { useContextMenu } from '../components/VContextMenu.vue';
import { openConfirmDialog } from '../components/dialogs/ConfirmDialog.vue';
import { useDialogStore } from '../stores/dialogStore';

const { data } = useRequest(formsApi.getAll)

const columns = {
  id: { title: "ID" },
  systemTable: { title: "Системная таблица" },
  name: { title: "Название" },
  endpoint: { title: "URL" }
}

const dialogStore = useDialogStore()
const contextMenu = useContextMenu((form: Form) => [
  { 
    title: "Удалить форму", 
    onClick: () => openConfirmDialog(dialogStore, async () => {
      await formsApi.deleteForm(form.id)
        mutateRequest(formsApi.getAll)
    })
  }
])

</script>

<style lang="sass">

</style>