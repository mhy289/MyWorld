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

    <!-- 添加的文本和超链接 -->
    <div class="additional-content mt-8">
      <h3 class="text-gray-800 text-lg mb-4">关于项目</h3>
      <p class="text-gray-600 mb-4">{{ t.description }}</p>
      <div class="links mb-6">
        <a href="https://space.bilibili.com/165392864" target="_blank" class="text-blue-600 hover:text-blue-800 mr-4">
          {{ t.link}}
        </a>
      </div>
      
      <!-- 视频内嵌区域 -->
      <div class="video-container">
        <h4 class="text-gray-700 text-md mb-3">{{ t.videoTitle }}</h4>
        <div v-if="loadingVideo" class="text-center py-8">
          <el-icon class="is-loading" :size="32" color="#409eff">
            <Loading />
          </el-icon>
          <p class="text-gray-500 mt-2">{{ t.loadingVideo }}</p>
        </div>
        <div v-else-if="videoError" class="text-center py-8">
          <el-icon :size="32" color="#f56c6c">
            <Warning />
          </el-icon>
          <p class="text-red-500 mt-2">{{ videoError }}</p>
          <el-button @click="fetchUserVideos" class="mt-3" size="small">
            {{ t.retry }}
          </el-button>
        </div>
        <div v-else-if="currentVideo" class="video-wrapper">
          <iframe
            :src="`https://player.bilibili.com/player.html?bvid=${currentVideo.bvid}&page=1&high_quality=1&danmaku=0`"
            scrolling="no"
            border="0"
            frameborder="no"
            framespacing="0"
            allowfullscreen="true"
            class="bilibili-player"
          ></iframe>
          <p class="text-gray-600 mt-3 text-center">{{ currentVideo.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';
const { Cloud, Loading, Warning } = Icons;
import { ElIcon, ElButton, ElSelect, ElOption } from 'element-plus';
import axios from 'axios';

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
    errorIP: "Failed to fetch IP. Please try again.",
    link: "Follow the streamer Thank You Meow",
    videoTitle: "Random Video from Channel",
    loadingVideo: "Loading video...",
    noVideos: "No videos found",
    videoFetchError: "Failed to fetch video, please try again",
    retry: "Retry"
  },
  zh: {
    title: "你好，Cloudflare Pages",
    heading: "你好，世界！",
    description: "🚀 这是一个部署在 Cloudflare Pages 上的静态页面。",
    language: "语言",
    getIP: "获取 IP",
    yourIP: "你的 IP 地址：",
    loadingIP: "正在加载 IP 地址...",
    errorIP: "获取 IP 失败，请重试。",
    link: "关注主播谢谢喵",
    videoTitle: "频道随机视频",
    loadingVideo: "正在加载视频...",
    noVideos: "未找到视频",
    videoFetchError: "获取视频失败，请重试",
    retry: "重试"
  },
  fr: {
    title: "Bonjour Cloudflare Pages",
    heading: "Bonjour le monde !",
    description: "🚀 Ceci est une page statique déployée sur Cloudflare Pages.",
    language: "Langue",
    getIP: "Obtenir l'IP",
    yourIP: "Votre adresse IP :",
    loadingIP: "Chargement de l'adresse IP...",
    errorIP: "Échec de la récupération de l'IP. Veuillez réessayer.",
    link: "Suivez le streamer Merci Miaou",
    videoTitle: "Vidéo Aléatoire de la Chaîne",
    loadingVideo: "Chargement de la vidéo...",
    noVideos: "Aucune vidéo trouvée",
    videoFetchError: "Échec du chargement de la vidéo, veuillez réessayer",
    retry: "Réessayer"
  },
  es: {
    title: "Hola Cloudflare Pages",
    heading: "¡Hola Mundo!",
    description: "🚀 Esta es una página estática desplegada en Cloudflare Pages.",
    language: "Idioma",
    getIP: "Obtener IP",
    yourIP: "Tu dirección IP:",
    loadingIP: "Cargando dirección IP...",
    errorIP: "Error al obtener la IP. Por favor, inténtalo de nuevo.",
    link: "Sigue al streamer Gracias Miau",
    videoTitle: "Video Aleatorio del Canal",
    loadingVideo: "Cargando video...",
    noVideos: "No se encontraron videos",
    videoFetchError: "Error al cargar el video, por favor inténtelo de nuevo",
    retry: "Reintentar"
  },
  pt: {
    title: "Olá Cloudflare Pages",
    heading: "Olá Mundo!",
    description: "🚀 Esta é uma página estática implantada no Cloudflare Pages.",
    language: "Idioma",
    getIP: "Obter IP",
    yourIP: "Seu endereço IP:",
    loadingIP: "Carregando endereço IP...",
    errorIP: "Falha ao obter o IP. Por favor, tente novamente.",
    link: "Siga o streamer Obrigado Miau",
    videoTitle: "Vídeo Aleatório do Canal",
    loadingVideo: "Carregando vídeo...",
    noVideos: "Nenhum vídeo encontrado",
    videoFetchError: "Falha ao carregar o vídeo, tente novamente",
    retry: "Tentar Novamente"
  },
  ru: {
    title: "Привет, Cloudflare Pages",
    heading: "Привет, мир!",
    description: "🚀 Это статическая страница, размещённая на Cloudflare Pages.",
    language: "Язык",
    getIP: "Получить IP",
    yourIP: "Ваш IP-адрес:",
    loadingIP: "Загрузка IP-адреса...",
    errorIP: "Не удалось получить IP. Пожалуйста, попробуйте снова.",
    link: "Следите за стримером Спасибо Мяу",
    videoTitle: "Случайное Видео с Канала",
    loadingVideo: "Загрузка видео...",
    noVideos: "Видео не найдены",
    videoFetchError: "Не удалось загрузить видео, попробуйте снова",
    retry: "Повторить"
  },
  ar: {
    title: "مرحبًا Cloudflare Pages",
    heading: "مرحبًا بالعالم!",
    description: "🚀 هذه صفحة ثابتة تم نشرها على Cloudflare Pages.",
    language: "اللغة",
    getIP: "الحصول على IP",
    yourIP: "عنوان IP الخاص بك:",
    loadingIP: "جاري تحميل عنوان IP...",
    errorIP: "فشل في جلب عنوان IP. يرجى المحاولة مرة أخرى.",
    link: "تابع الستريمر شكراً مياو",
    videoTitle: "فيديو عشوائي من القناة",
    loadingVideo: "جاري تحميل الفيديو...",
    noVideos: "لم يتم العثور على فيديوهات",
    videoFetchError: "فشل في تحميل الفيديو، يرجى المحاولة مرة أخرى",
    retry: "إعادة المحاولة"
  }
};

const language = ref('en');
const ip = ref('');
const loading = ref(false);
const error = ref(false);

// 视频相关状态
const loadingVideo = ref(false);
const videoError = ref('');
const userVideos = ref([]);
const currentVideo = ref(null);
const userId = '165392864'; // B站用户ID

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
  fetchUserVideos();
});

const t = computed(() => translations[language.value]);

// 获取用户视频列表
const fetchUserVideos = async () => {
  loadingVideo.value = true;
  videoError.value = '';
  
  try {
    // 使用B站API获取用户视频列表
    const response = await axios.get(`https://api.bilibili.com/x/space/arc/search`, {
      params: {
        mid: userId,
        ps: 30, // 每页数量
        pn: 1   // 页码
      },
      timeout: 10000
    });

    if (response.data.code === 0 && response.data.data.list.vlist.length > 0) {
      userVideos.value = response.data.data.list.vlist;
      // 随机选择一个视频
      const randomIndex = Math.floor(Math.random() * userVideos.value.length);
      currentVideo.value = userVideos.value[randomIndex];
    } else {
      videoError.value = t.value.noVideos || '未找到视频';
    }
  } catch (err) {
    console.error('获取视频失败:', err);
    videoError.value = t.value.videoFetchError || '获取视频失败，请重试';
  } finally {
    loadingVideo.value = false;
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.additional-content {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.links {
  display: flex;
  gap: 12px;
}

.links a {
  text-decoration: none;
  transition: color 0.3s;
}

.video-container {
  margin-top: 16px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bilibili-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
}
</style>