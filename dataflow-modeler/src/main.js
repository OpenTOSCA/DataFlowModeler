import { createApp } from 'vue'
import App from './App.vue'
import store from "@/plugins/store";
// import vuetify from "@/plugins/vuetify";
import '@/assets/drawflow.css'
import '@/assets/beautiful.css'

global.jQuery = require('jquery');
let $ = global.jQuery;
window.$ = $;

const app= createApp(App)
app.use(store)
// app.use(vuetify)
app.mount('#app')


