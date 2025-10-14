import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/styles.css';
import axios from 'axios';

// 基础路径
axios.defaults.baseURL = "http://localhost:8080"

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
