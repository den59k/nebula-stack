<template>
  <div ref="resizerRef" class="v-resize-area" :style="style">
    <slot></slot>
    <div v-for="resizer in resizers" :style="getResizerStyle(resizer)" class="v-resize-area__resizer" @mousedown="onMouseDown($event, resizer)">
      
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CSSProperties, computed, ref } from 'vue';
import { handleMove } from 'vuesix';

type Resize = "left" | "top" | "right" | "bottom" | "horizontal" | "vertical" | "all"
const props = defineProps<{ resize?: Resize }>()
const resizers = computed<[number,number][]>(() => {
  if (props.resize === "left") return [[-1, 0]]
  if (props.resize === "right") return [[1, 0]]
  if (props.resize === "top") return [[0, -1]]
  if (props.resize === "bottom") return [[0,1]]
  if (props.resize === "vertical") return [[0,-1], [0,11]]
  if (props.resize === "horizontal") return [[-1, 0],[0,1]]
  return [[-1,0],[0,-1],[1,0],[0,1]]
})

const lineWidth = 20
const getResizerStyle = (resizer: [number, number]): CSSProperties => {
  if (resizer[0] === -1) return { left: `${-lineWidth*0.5}px`, width: `${lineWidth}px`, cursor: "ew-resize", top: "0px", bottom: "0px" }
  if (resizer[0] === 1) return { right: `${-lineWidth*0.5}px`, width: `${lineWidth}px`, cursor: "ew-resize", top: "0px", bottom: "0px" }
  if (resizer[1] === -1) return { top: `${-lineWidth*0.5}px`, width: `${lineWidth}px`, cursor: "ns-resize", left: "0px", right: "0px" }
  if (resizer[1] === 1) return { bottom: `${-lineWidth*0.5}px`, width: `${lineWidth}px`, cursor: "ns-resize", left: "0px", right: "0px" }
  return {}
}

const width = ref<number | null>(null)
const height = ref<number | null>(null)
const style = computed(() => ({
  width: width.value === null? undefined: `${width.value}px`,
  height: height.value === null? undefined: `${height.value}px`
}))

const onMouseDown = (e: MouseEvent, resizer: [number,number]) => {
  const { clientWidth, clientHeight } = (e.currentTarget as HTMLElement).parentElement!
  let resize = false
  
  document.body.classList.add("mousedrag")
  document.body.style.cursor = getResizerStyle(resizer).cursor!

  handleMove(e, {
    onMove({ pos, startPos }) {
      const x = (pos.x-startPos.x) * resizer[0]
      const y = (pos.y-startPos.y) * resizer[1]
      if (!resize && Math.abs(x) < 4 && Math.abs(y) < 4) return
      resize = true
      if (x !== null) {
        width.value = clientWidth + x
      }
      if (y !== null) {
        height.value = clientHeight + y
      }
    },
    onEnd() {
      document.body.classList.remove("mousedrag")
      document.body.style.cursor = ""
    }
  })
}

</script>

<style lang="sass">
.v-resize-area
  position: relative

.v-resize-area__resizer
  position: absolute


</style>