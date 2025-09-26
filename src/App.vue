
<script setup>
import { ref, reactive, onMounted } from 'vue';

const translations = {
  en: {
    title: "Hello Cloudflare Pages",
    heading: "Hello World!",
    description: "🚀 This is a static page deployed on Cloudflare Pages.",
    language: "Language",
    getIP: "Get IP",
    yourIP: "Your IP Address:",
    loadingIP: "Loading IP address..."
  },
  zh: {
    title: "你好 Cloudflare Pages",
    heading: "你好，世界！",
    description: "🚀 这是一个部署在Cloudflare Pages上的静态页面。",
    language: "语言",
    getIP: "获取IP",
    yourIP: "你的IP地址：",
    loadingIP: "正在加载IP地址..."
  },
  fr:{
    title: "Bonjour Cloudflare Pages",
    heading: "Bonjour le monde!",
    description: "🚀 C'est une page statique déployée sur Cloudflare Pages.",
    language: "Langue",
    getIP: "Obtenir l'IP",
    yourIP: "Votre adresse IP :",
    loadingIP: "Chargement de l'adresse IP..."
  },
  es:{
    title: "Hola Cloudflare Pages",
    heading: "Hola mundo!",
    description: "🚀 Esta es una página estática implementada en Cloudflare Pages.",
    language: "Idioma",
    getIP: "Obtener IP",
    yourIP: "Tu dirección IP:",
    loadingIP: "Cargando dirección IP..."
  }
};

const lang = ref(localStorage.getItem('preferredLanguage') || 'en');
const ip = ref('');
const loading = ref(false);
const showIP = ref(false);

const t = reactive(translations[lang.value]);

function setLanguage(newLang) {
  lang.value = newLang;
  localStorage.setItem('preferredLanguage', newLang);
  Object.assign(t, translations[newLang]);
  document.documentElement.lang = newLang;
  document.title = t.title;
}

async function getIP() {
  loading.value = true;
  showIP.value = true;
  ip.value = '';
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ip.value = data.ip;
  } catch (e) {
    ip.value = 'Error';
  }
  loading.value = false;
}

onMounted(() => {
  setLanguage(lang.value);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <!-- 语言选择器 -->
    <div class="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md">
      <label for="language-select" class="mr-2 text-gray-700">{{ t.language }}</label>
      <select
        id="language-select"
        v-model="lang"
        @change="setLanguage(lang)"
        class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </div>

    <div class="text-center max-w-md">
      <h1 class="text-4xl font-bold text-gray-900 mb-6 transition-all duration-300">{{ t.heading }}</h1>
      <p class="text-xl text-gray-700 mb-8">{{ t.description }}</p>

      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 transition-all duration-200 transform hover:scale-105" @click="getIP">
        {{ t.getIP }}
      </button>

      <!-- IP地址显示区域 -->
      <div v-if="showIP" class="my-4 text-lg text-gray-700 min-h-[24px]">
        <span class="font-medium">{{ t.yourIP }}</span>
        <span v-if="loading">{{ t.loadingIP }}</span>
        <span v-else class="text-blue-600 font-mono">{{ ip }}</span>
      </div>

      <!-- 装饰元素 -->
      <div class="flex justify-center mt-8">
        <div class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fa fa-cloud text-4xl text-blue-500"></i>
        </div>
      </div>
    </div>
  </div>
</template>


