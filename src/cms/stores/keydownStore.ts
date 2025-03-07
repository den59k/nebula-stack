import { MultiMap } from "vuesix";
import { defineStore } from "pinia";
import { WatchSource, watch } from "vue";

export const useKeyDownStore = defineStore('key-down', () => {

  const listeners = new MultiMap<string, (e: KeyboardEvent) => void>()

  const addListener = listeners.add.bind(listeners)
  const removeListener = listeners.remove.bind(listeners)

  const onKeyDown = (e: KeyboardEvent) => {
    if (!listeners.has(e.code)) return
    const _listeners = listeners.get(e.code)
    e.preventDefault()
    const callback = _listeners[_listeners.length-1]
    callback(e)
  }

  document.addEventListener("keydown", onKeyDown)

  const _watch = (code: string, watcher: WatchSource<boolean>, callback: () => void) => {
    return watch(watcher, (value) => {
      if (value) {
        addListener(code, callback)
      } else {
        removeListener(code, callback)
      }
    })
  }

  return {
    addListener,
    removeListener,
    watch: _watch,
    onKeyDown
  }
})