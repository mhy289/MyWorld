
<script setup>
import { ref, reactive, onMounted, computed } from 'vue';

// 多语言配置
const translations = {
  en: {
    title: "Hello Cloudflare Pages",
    heading: "Hello World!",
    description: "🚀 This is a static page deployed on Cloudflare Pages.",
    language: "Language",
    getIP: "Get IP",
    yourIP: "Your IP Address:",
    loadingIP: "Loading IP address...",
    errorIP: "Failed to fetch IP. Please try again."
  },
  zh: {
    title: "你好 Cloudflare Pages",
    heading: "你好，世界！",
    description: "🚀 这是一个部署在Cloudflare Pages上的静态页面。",
    language: "语言",
    getIP: "获取IP",
    yourIP: "你的IP地址：",
    loadingIP: "正在加载IP地址...",
    errorIP: "获取IP失败，请重试。"
  },
  fr: {
    title: "Bonjour Cloudflare Pages",
    heading: "Bonjour le monde!",
    description: "🚀 C'est une page statique déployée sur Cloudflare Pages.",
    language: "Langue",
    getIP: "Obtenir l'IP",
    yourIP: "Votre adresse IP :",
    loadingIP: "Chargement de l'adresse IP...",
    errorIP: "Échec de la récupération de l'IP. Veuillez réessayer."
  },
  es: {
    title: "Hola Cloudflare Pages",
    heading: "Hola mundo!",
    description: "🚀 Esta es una página estática implementada en Cloudflare Pages.",
    language: "Idioma",
    getIP: "Obtener IP",
    yourIP: "Tu dirección IP:",
    loadingIP: "Cargando dirección IP...",
    errorIP: "Error al obtener la IP. Por favor, inténtalo de nuevo."
  }
};

// 响应式状态
const lang = ref(localStorage.getItem('preferredLanguage') || 'en');
const ip = ref('');
const loading = ref(false);
const showIP = ref(false);
const error = ref(false);

// 动态翻译对象
const t = computed(() => translations[lang.value]);

// 设置语言
function setLanguage(newLang) {
  lang.value = newLang;
  localStorage.setItem('preferredLanguage', newLang);
  document.documentElement.lang = newLang;
  document.title = t.value.title;
}

// 获取IP地址
async function getIP() {
  loading.value = true;
  showIP.value = true;
  error.value = false;
  ip.value = '';

  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    ip.value = data.ip;
  } catch (e) {
    error.value = true;
    ip.value = t.value.errorIP;
  } finally {
    loading.value = false;
  }
}

// 初始化语言
onMounted(() => {
  setLanguage(lang.value);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
    <!-- 语言选择器 -->
    <div class="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md z-10">
      <label for="language-select" class="mr-2 text-gray-700 font-medium">{{ t.language }}</label>
      <select
        id="language-select"
        v-model="lang"
        @change="setLanguage(lang)"
        class="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </div>

    <div class="text-center max-w-md mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-6 transition-all duration-300 hover:text-blue-600">
        {{ t.heading }}
      </h1>
      <p class="text-lg text-gray-600 mb-8 leading-relaxed">
        {{ t.description }}
      </p>

      <button
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg mb-6 transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 mx-auto"
        @click="getIP"
        :disabled="loading"
      >
        <span v-if="!loading">{{ t.getIP }}</span>
        <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>

      <!-- IP地址显示区域 -->
      <div v-if="showIP" class="my-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
        <p class="text-lg font-medium text-gray-700 mb-1">{{ t.yourIP }}</p>
        <div class="min-h-8 flex items-center justify-center">
          <span v-if="loading" class="text-gray-500">{{ t.loadingIP }}</span>
          <span v-else-if="error" class="text-red-500 font-medium">{{ ip }}</span>
          <span v-else class="text-blue-600 font-mono text-xl">{{ ip }}</span>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="flex justify-center mt-10">
        <div class="w-24 h-24 rounded-full bg-blue-100/50 flex items-center justify-center shadow-inner">
          <i class="fa fa-cloud text-4xl text-blue-500 opacity-80"></i>
        </div>
      </div>
    </div>
  </div>
</template>


