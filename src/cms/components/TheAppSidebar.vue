<template>
  <nav class="the-app-sidebar">
    <div class="headline">
      <img width="32" class="ml-n1" src="../assets/images/logo.svg" alt="Nebula Stack Logo" />
      Nebula Stack
    </div>
    <ul>
      <li v-for="item in menuItems">
        <div v-if="(typeof item === 'string')" class="menu-item__group">{{ item }}</div>
        <router-link v-else :to="item.to" active-class="active">{{ item.title }}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useRequest } from 'vuesix';
import { accountApi } from '../api/accountApi';
import { computed } from 'vue';

const { data } = useRequest<any, any[]>(accountApi.getSidebarItems)

const menuItems = computed(() => [
  { title: "Статистика", to: "/" },
  "Данные",
  ...(data.value ?? []).map(item => ({
    title: item.name,
    to: `/data/${item.systemTable}`
  })),
  "Администрирование",
  { title: "Отображения", to: "/views" },
  { title: "Формы", to: "/forms" },
])

</script>

<style lang="sass">
nav.the-app-sidebar
  width: 240px
  flex: 0 0 auto
  background-color: var(--paper-color)
  border-right: 1px solid var(--border-color)

  .headline
    font-weight: 700
    display: flex
    align-items: center
    padding: 0 16px
    height: 60px
    font-size: 18px
    gap: 8px    

  li a
    display: flex
    text-decoration: none
    color: var(--text-color)
    height: 48px
    align-items: center
    padding: 0 16px
    font-size: 13px

    &:hover
      background-color: var(--hover-color)

    &.active
      color: var(--text-active-color)
      background-color: var(--background-active-color)

  .menu-item__group
    padding: 0 16px
    font-size: 13px
    margin-top: 12px
    color: var(--text-secondary-color)

</style>