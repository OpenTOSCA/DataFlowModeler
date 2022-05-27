import { createApp } from 'vue'
import App from './App.vue'
import store from "@/plugins/store";
import '@/assets/beautiful.css'
import '@/assets/drawflow.css'


const app= createApp(App)
app.mount('#app')
app.use(store)


