import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/styles.css';
import axios from 'axios';

// 基础路径
axios.defaults.baseURL = "http://localhost:8080"

// 暗色模式初始化
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
