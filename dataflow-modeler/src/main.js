import { createApp } from 'vue'
import App from './App.vue'
import store from "@/plugins/store";
// import vuetify from "@/plugins/vuetify";
import '@/assets/drawflow.css'
import '@/assets/beautiful.css'


const app= createApp(App)
app.use(store)
// app.use(vuetify)
app.mount('#app')


