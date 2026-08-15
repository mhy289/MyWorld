import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/styles.css';

// 主题初始化（亮色 / 暗色 / 跟随系统）
const savedMode = localStorage.getItem('theme_mode') || localStorage.getItem('theme') || 'light';
const applyDark = savedMode === 'dark' ||
  (savedMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
if (applyDark) {
  document.documentElement.classList.add('dark');
}

const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');

// 注册 Service Worker（仅生产环境，开发环境避免影响 HMR）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service Worker 注册失败:', err);
    });
  });
}
