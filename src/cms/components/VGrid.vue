<template>
  <div class="v-grid">
    <component :is="component" v-for="item in props.items" v-bind="bind(item)" class="v-grid__item">
      <slot name="item" :item="item"></slot>
    </component>
  </div>
</template>

<script lang="ts" setup generic="T">
import { computed } from 'vue';

const props = defineProps<{ 
  items: T[],
  to?: (item: T) => string
}>()

const component = computed(() => {
  if (props.to) return "router-link"
  return "button"
})

const bind = (item: T) => {
  if (props.to) {
    return {
      to: props.to(item)
    }
  }
  return {}
}

</script>

<style lang="sass">
.v-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))
  gap: 30px

.v-grid__item
  height: 20px
  border-radius: 20px
  background-color: var(--paper-color)
  border: 1px solid var(--border-color)
  display: flex
  flex-direction: column
  text-decoration: none
  color: var(--text-color)
  overflow: hidden

  &:hover
    background-color: var(--hover-color-alt)

</style>