<template>
  <VCard compact>
    <template #header>
      Схемы данных
    </template>
    <VTable 
      v-if="data"
      :data="data" 
      :columns="columns" 
      :to="item => `/tables/${item.name}`"
    />
  </VCard>
</template>

<script lang="ts" setup>
import { useRequest } from 'vuesix';
import { Columns } from '../components/VTable.vue';
import { tablesApi } from '../api/tablesApi';

// const { data } = useRequest(tablesApi.getAll)
const data: any[] = []

const columns: Columns<any> = {
  name: { title: "Заголовок" },
  views: { title: "Отображений", map: (item) => item.views?.length },
  forms: { title: "Форм", map: (item) => item.forms?.length }
}

</script>

<style lang="sass">

</style>