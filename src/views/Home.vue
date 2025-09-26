<template>
  <div class="home-container">
    <el-card>
      <div class="flex justify-between mb-4">
        <el-select v-model="language" class="w-32">
          <el-option label="English" value="en" />
          <el-option label="中文" value="zh" />
          <el-option label="Français" value="fr" />
          <el-option label="Español" value="es" />
          <el-option label="Português" value="pt" />
          <el-option label="Русский" value="ru" />
          <el-option label="العربية" value="ar" />
        </el-select>
        <el-button @click="getIP" :loading="loading">
          {{ t.getIP }}
        </el-button>
      </div>

      <div v-if="loading" class="text-gray-500 font-mono text-xl">
        {{ t.loadingIP }}
      </div>
      <div v-else-if="error" class="text-red-500 font-mono text-xl">
        {{ t.errorIP }}
      </div>
      <div v-else>
        <p class="text-gray-600 font-mono">{{ t.yourIP }}</p>
        <span class="text-blue-600 font-mono text-xl">{{ ip }}</span>
      </div>
    </el-card>

    <!-- 装饰元素 -->
    <div class="flex justify-center mt-10">
      <el-icon :size="60" color="#3b82f6" :opacity="0.8">
        <component :is="Cloud" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';
const { Cloud } = Icons;
import { ElIcon, ElButton, ElSelect, ElOption } from 'element-plus';

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
    title: "你好，Cloudflare Pages",
    heading: "你好，世界！",
    description: "🚀 这是一个部署在 Cloudflare Pages 上的静态页面。",
    language: "语言",
    getIP: "获取 IP",
    yourIP: "你的 IP 地址：",
    loadingIP: "正在加载 IP 地址...",
    errorIP: "获取 IP 失败，请重试。"
  },
  fr: {
    title: "Bonjour Cloudflare Pages",
    heading: "Bonjour le monde !",
    description: "🚀 Ceci est une page statique déployée sur Cloudflare Pages.",
    language: "Langue",
    getIP: "Obtenir l'IP",
    yourIP: "Votre adresse IP :",
    loadingIP: "Chargement de l'adresse IP...",
    errorIP: "Échec de la récupération de l'IP. Veuillez réessayer."
  },
  es: {
    title: "Hola Cloudflare Pages",
    heading: "¡Hola Mundo!",
    description: "🚀 Esta es una página estática desplegada en Cloudflare Pages.",
    language: "Idioma",
    getIP: "Obtener IP",
    yourIP: "Tu dirección IP:",
    loadingIP: "Cargando dirección IP...",
    errorIP: "Error al obtener la IP. Por favor, inténtalo de nuevo."
  },
  pt: {
    title: "Olá Cloudflare Pages",
    heading: "Olá Mundo!",
    description: "🚀 Esta é uma página estática implantada no Cloudflare Pages.",
    language: "Idioma",
    getIP: "Obter IP",
    yourIP: "Seu endereço IP:",
    loadingIP: "Carregando endereço IP...",
    errorIP: "Falha ao obter o IP. Por favor, tente novamente."
  },
  ru: {
    title: "Привет, Cloudflare Pages",
    heading: "Привет, мир!",
    description: "🚀 Это статическая страница, размещённая на Cloudflare Pages.",
    language: "Язык",
    getIP: "Получить IP",
    yourIP: "Ваш IP-адрес:",
    loadingIP: "Загрузка IP-адреса...",
    errorIP: "Не удалось получить IP. Пожалуйста, попробуйте снова."
  },
  ar: {
    title: "مرحبًا Cloudflare Pages",
    heading: "مرحبًا بالعالم!",
    description: "🚀 هذه صفحة ثابتة تم نشرها على Cloudflare Pages.",
    language: "اللغة",
    getIP: "الحصول على IP",
    yourIP: "عنوان IP الخاص بك:",
    loadingIP: "جاري تحميل عنوان IP...",
    errorIP: "فشل في جلب عنوان IP. يرجى المحاولة مرة أخرى."
  }
};

const language = ref('en');
const ip = ref('');
const loading = ref(false);
const error = ref(false);

const getIP = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ip.value = data.ip;
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getIP();
});

const t = computed(() => translations[language.value]);
</script>

<style scoped>
.home-container {
  padding: 20px;
}
</style>