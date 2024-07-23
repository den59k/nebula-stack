<template>
  <VCard compact>
    <template #header>
      Отображения
      <VButton to="/views/new">Создать отображение</VButton>
    </template>
    <VTable 
      v-if="data" 
      :columns="columns" 
      :data="data" 
      :to="item => `/views/${item.id}`" 
      @itemcontext="contextMenu.open"
    >
      <template #showInAdmin="{ cell }">
        <VIcon v-if="cell && cell !== 'none'" icon="check" />
        <div v-else>-</div>
      </template>
    </VTable>
    <VContextMenu v-bind="contextMenu.props"/>
  </VCard>
</template>

<script lang="ts" setup>
import { mutateRequest, useRequest } from 'vuesix';
import { View, viewsApi } from '../api/viewsApi';
import { useContextMenu } from '../components/VContextMenu.vue';
import { useDialogStore } from '../stores/dialogStore';
import { openConfirmDialog } from '../components/dialogs/ConfirmDialog.vue'

const { data } = useRequest(viewsApi.getAll)

const columns = {
  id: { title: "ID" },
  systemTable: { title: "Системная таблица" },
  name: { title: "Название" },
  showInAdmin: { title: "Отображать в админ-панели" }
}

const dialogStore = useDialogStore()
const contextMenu = useContextMenu((view: View) => [
  { 
    title: "Удалить отображение", 
    onClick: () => openConfirmDialog(dialogStore, async () => {
      await viewsApi.deleteView(view.id)
        mutateRequest(viewsApi.getAll)
    })
  }
])

</script>

<style lang="sass">

</style>