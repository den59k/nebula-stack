<template>
  <div class="v-progress-bar">
    <div class="v-progress-bar__progress" :style="{ width: props.progress+'%' }">

    </div>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps<{ progress: number }>()

</script>

<style lang="sass">
.v-progress-bar
  height: 30px
  width: 100%
  border-radius: 12px
  box-shadow: inset 0 0 0px 1px var(--border-color)
  position: relative
  overflow: hidden

.v-progress-bar__progress
  background-color: var(--primary-color)
  position: absolute
  left: 0
  top: 0
  bottom: 0
  border-radius: 12px
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1)

</style>