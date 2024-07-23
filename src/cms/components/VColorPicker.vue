<template>
  <VInput v-model="vModel" class="v-colorpicker" :validator="colorValidator">
    <template #end-adornment>
      <VPopover class="v-colorpicker__menu" placement="bottom-end" :offset="6">
        <template #activator="{ props }">
          <button v-bind="props" class="v-colorpicker__activator" :style="{ backgroundColor: finalColor }">

          </button>
        </template>

        <div ref="pickerRef" class="v-colorpicker__picker" :style="{ backgroundColor: hueColor }" @mousedown="onMouseDown">
          <div class="saturation"></div>
          <div class="value"></div>
          <div 
            class="picker" 
            :style="{ 
              top: (1-values.value)*activeArea[1]*100+'%', 
              left: values.saturation*activeArea[0]*100+'%',
              backgroundColor: color
            }"
          ></div>
        </div>
        <VSlider v-model="values.hue" :max="360" class="v-colorpicker__slider v-colorpicker__hue"/>
        <VSlider v-model="values.alpha" :max="1" class="v-colorpicker__slider v-colorpicker__alpha">
          <div class="gradient" :style="{ color }"></div>
        </VSlider>
      </VPopover>
    </template>
  </VInput>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { handleMove } from 'vuesix';
import { clamp, useResizeObserver, useVModel } from '@vueuse/core';
import { hsla, toHex, parseToHsla } from 'color2k'

const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits([ "update:modelValue" ])
const vModel = useVModel(props, "modelValue", emit, { passive: true, defaultValue: "#FFFFFF" })

const values = reactive({
  saturation: 0,
  value: 1,
  hue: 0,
  alpha: 1
})

const hueColor = computed(() => `hsl(${values.hue}, 100%, 50%)`)

const pickerRef = ref<HTMLDivElement>()
const activeArea = ref([ 1, 1 ])
const PICKER_SIZE = 14
useResizeObserver(pickerRef, ([ entry ]) => {
  const { width, height} = entry.contentRect
  activeArea.value = [ (width-PICKER_SIZE)/width, (height-PICKER_SIZE)/height ]
})

const onMouseDown = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  handleMove(e, {
    onStart() {
      document.body.classList.add("mousedrag")
    },
    onMove({ pos }) {
      values.saturation = clamp((pos.x - PICKER_SIZE/2) /(rect.width*activeArea.value[0]), 0, 1)
      values.value = 1 - clamp((pos.y - PICKER_SIZE/2) /(rect.height*activeArea.value[1]), 0, 1)
    },
    onEnd() {
      document.body.classList.remove("mousedrag")
    }
  })
}

const getHsla = (includeAlpha = false) => {
  const l = values.value * (1 - values.saturation * 0.5)
  const min = Math.min(l, 1-l)
  const s = min === 0? 0: (values.value - l) / min
  if (includeAlpha) {
    return hsla(values.hue, s, l, values.alpha)
  } else {
    return hsla(values.hue, s, l, 1)
  }
}

const color = computed(() => getHsla())
const finalColor = computed(() => toHex(getHsla(true)).toUpperCase())
let lastValue = ""

watch(finalColor, (finalColor) => {
  lastValue = finalColor
  vModel.value = finalColor
})

watch(vModel, (inputValue) => {
  if (inputValue === lastValue) return
  try {
    const [ hue, s, l, alpha ] = parseToHsla(inputValue!)
    const value = l + s * (Math.min(l, 1-l))
    const saturation = value === 0? 0: (2 * (1 - l/value))
    Object.assign(values, { hue, value, saturation, alpha })
  } catch(e) {
    console.warn(e)
  }
}, { immediate: true })

const colorValidator = (str: string) => {
  if (str === lastValue) return str
  try {
    if (!str.startsWith("#") && str.length < 9) {
      return toHex("#"+str).toUpperCase()
    }
    return toHex(str).toUpperCase()
  } catch {
    return null
  }
}

</script>

<style lang="sass">

.v-colorpicker__activator
  width: 60px
  background-color: red
  border-radius: 6px
  margin: 4px
  border: 1px solid var(--border-color)
  box-sizing: border-box

.v-colorpicker__menu
  width: 250px
  padding: 12px
  display: flex
  flex-direction: column
  gap: 20px

.v-colorpicker__picker
  background-color: red  
  height: 140px
  border-radius: 6px
  position: relative

  .saturation
    background-image: linear-gradient(90deg,#fff,rgba(204,154,129,0))
    position: absolute
    inset: 0
    border-radius: 6px

  .value
    background-image: linear-gradient(0deg,#000,rgba(204,154,129,0))
    position: absolute
    inset: 0
    border-radius: 5px
    cursor: pointer

  .picker
    position: absolute
    top: 0
    left: 0
    border: 2px solid white
    width: 14px
    height: 14px
    border-radius: 9999px
    pointer-events: none
    box-sizing: border-box

.v-colorpicker__hue
  background: linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)

.v-colorpicker__alpha
  background-image: linear-gradient(45deg,#aaa 25%,transparent 0),linear-gradient(-45deg,#aaa 25%,transparent 0),linear-gradient(45deg,transparent 75%,#aaa 0),linear-gradient(-45deg,transparent 75%,#aaa 0)
  background-repeat: repeat
  background-size: 10px 10px
  background-position: 0 0,0 5px,5px -5px,-5px 0

  .gradient
    color: red
    background: linear-gradient(90deg, transparent 0%, currentColor 100%)
    border-radius: 4px
    position: absolute
    inset: 0

</style>