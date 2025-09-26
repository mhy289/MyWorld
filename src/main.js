import { createApp } from 'vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');;
import './assets/styles.css';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
