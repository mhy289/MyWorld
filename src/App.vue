
<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import Cloud from '@element-plus/icons-vue/es/Cloud';
import { ElIcon } from 'element-plus';

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

// 语言选项
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' }
];

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
    <div class="absolute top-4 right-4">
      <el-select
        v-model="lang"
        @change="setLanguage(lang)"
        placeholder="选择语言"
        class="w-40"
      >
        <el-option
          v-for="item in languageOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <div class="text-center max-w-md mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-6 transition-all duration-300 hover:text-blue-600">
        {{ t.heading }}
      </h1>
      <p class="text-lg text-gray-600 mb-8 leading-relaxed">
        {{ t.description }}
      </p>

      <el-button
        type="primary"
        @click="getIP"
        :loading="loading"
        class="w-40"
      >
        {{ t.getIP }}
      </el-button>

      <!-- IP地址显示区域 -->
      <el-card v-if="showIP" class="my-4 w-80 mx-auto">
        <p class="text-lg font-medium text-gray-700 mb-1">{{ t.yourIP }}</p>
        <div class="min-h-8 flex items-center justify-center">
          <span v-if="loading" class="text-gray-500">{{ t.loadingIP }}</span>
          <span v-else-if="error" class="text-red-500 font-medium">{{ ip }}</span>
          <span v-else class="text-blue-600 font-mono text-xl">{{ ip }}</span>
        </div>
      </el-card>

      <!-- 装饰元素 -->
      <div class="flex justify-center mt-10">
        <el-icon :size="60" color="#3b82f6" :opacity="0.8">
          <component :is="Cloud" />
        </el-icon>
      </div>
    </div>
  </div>
</template>


