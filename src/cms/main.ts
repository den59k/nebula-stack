import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.sass'
import { createPinia } from 'pinia'
import { registerComponents } from './registerComponents'
import { router } from './router'

createApp(App)  
  .use(createPinia())
  .use(router)
  .use(registerComponents)
  .mount('#app')

