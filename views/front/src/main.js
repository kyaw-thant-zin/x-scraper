import { createApp, markRaw, onMounted } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
// import CanvasJSChart from '@canvasjs/vue-charts'
import { Quasar, Loading, Notify, Dialog } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'
import '@quasar/extras/mdi-v6/mdi-v6.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

//  Main SCSS link
import '@/assets/scss/style.scss'


import { useXStore } from '@/stores/X'
import { useTtStore } from '@/stores/Tt'
import { useInstaStore } from '@/stores/Insta'
import { useYtStore } from '@/stores/Yt'

const pinia = createPinia()
pinia.use(({ store }) => {
    store.router = markRaw(router)
  },
)

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(Quasar, {
    plugins: {
      Loading,
      Notify,
      Dialog
    }, // import Quasar plugins and add here
})
// app.use(CanvasJSChart)

useXStore().handleRefreshProcess()
useTtStore().handleRefreshProcess()
useInstaStore().handleRefreshProcess()
useYtStore().handleRefreshProcess()

app.mount('#app')

