<template>
  <div v-if="accountStore.status === 'init'"></div>
  <router-view v-else-if="accountStore.status !== 'authorized' || currentRoute.meta.showSidebar === false"/>
  <div v-else class="app-layout">
    <TheAppSidebar/>
    <div class="app-layout__main">
      <router-view/>
    </div>
  </div>
  <TheDialogBase/>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useAccountStore } from './stores/accountStore';
import TheDialogBase from './components/TheDialogBase.vue';
import TheAppSidebar from './components/TheAppSidebar.vue';
import { useRoute } from 'vue-router';

const accountStore = useAccountStore()
const currentRoute = useRoute()

onMounted(() => {
  accountStore.init()
})

</script>

<style lang="sass">
.app-layout
  display: flex
  min-height: 100vh

.app-layout__main
  flex: 1 1 auto
  display: flex
  flex-direction: column
  padding: 20px
  
</style>