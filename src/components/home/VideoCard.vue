<template>
  <div class="video-card">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <el-icon :size="18" color="#fb7299"><VideoPlay /></el-icon>
            <span class="font-medium">{{ t.videoTitle }}</span>
          </span>
          <el-button size="small" circle @click="refreshVideo" :loading="loading">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-12">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <span class="text-gray-500 dark:text-gray-400 text-sm">{{ t.loadingVideo }}</span>
        <div v-if="progress > 0 && progress < 100" class="w-64">
          <el-progress :percentage="progress" :stroke-width="6" :show-text="false" />
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="flex flex-col items-center gap-3 py-12">
        <el-icon :size="24" color="#f56c6c"><WarningFilled /></el-icon>
        <span class="text-red-500 dark:text-red-400">{{ errorText }}</span>
        <el-button type="primary" size="small" @click="refreshVideo">{{ t.retry }}</el-button>
      </div>

      <!-- 视频播放 -->
      <div v-else-if="currentVideo">
        <div class="video-frame">
          <iframe
            v-if="isYouTubeUrl(currentVideo.video)"
            :src="currentVideo.video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <iframe
            v-else
            :src="currentVideo.video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
          <span class="font-medium text-sm">{{ currentVideo.title }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
            <span class="flex items-center gap-1">
              <el-icon><View /></el-icon>
              {{ formatPlayCount(currentVideo.play) }}
            </span>
            <span>{{ formatDate(currentVideo.created) }}</span>
          </span>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-400">{{ t.noVideos }}</div>
    </el-card>

    <!-- 关于项目 + 装饰 -->
    <div class="about-section">
      <div class="about-content">
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ t.description }}</span>
        <a
          :href="t.projectLink"
          target="_blank"
          class="about-link text-sm"
        >
          <el-icon><Link /></el-icon>
          {{ t.projectSource }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { VideoPlay, Refresh, Loading, WarningFilled, View, Link } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { request } from '../../api/request';
import { useI18n } from '../../composables/useI18n';

const translations = {
  en: {
    videoTitle: 'Featured Video', loadingVideo: 'Loading videos...', retry: 'Retry', noVideos: 'No videos available.',
    connectionError: 'Cannot connect to the server. Showing fallback videos...', rateLimitError: 'Server is busy, retrying...',
    accessDenied: 'Access denied', userNotFound: 'User not found', loadSuccess: 'Video loaded', retrySuccess: 'Connected!',
    playCount: 'plays', description: 'A personal homepage project powered by Vue 3 & Go.', projectSource: 'Project Source',
    projectLink: 'https://github.com/'
  },
  zh: {
    videoTitle: '精选视频', loadingVideo: '正在加载视频...', retry: '重试', noVideos: '暂无视频',
    connectionError: '无法连接到服务器，正在加载备用视频...', rateLimitError: '服务器繁忙，正在重试...',
    accessDenied: '访问被拒绝', userNotFound: '用户不存在', loadSuccess: '视频加载成功', retrySuccess: '连接成功！',
    playCount: '次播放', description: '基于 Vue 3 与 Go 的个人主页项目。', projectSource: '项目源码',
    projectLink: 'https://github.com/'
  },
  fr: {
    videoTitle: 'Vidéo vedette', loadingVideo: 'Chargement des vidéos...', retry: 'Réessayer', noVideos: 'Aucune vidéo.',
    connectionError: 'Connexion impossible. Chargement des vidéos de secours...', rateLimitError: 'Serveur occupé, nouvelle tentative...',
    accessDenied: 'Accès refusé', userNotFound: 'Utilisateur introuvable', loadSuccess: 'Vidéo chargée', retrySuccess: 'Connecté !',
    playCount: 'lectures', description: 'Un projet de page personnelle avec Vue 3 et Go.', projectSource: 'Code source',
    projectLink: 'https://github.com/'
  },
  es: {
    videoTitle: 'Video destacado', loadingVideo: 'Cargando videos...', retry: 'Reintentar', noVideos: 'Sin videos.',
    connectionError: 'No se puede conectar. Cargando videos de respaldo...', rateLimitError: 'Servidor ocupado, reintentando...',
    accessDenied: 'Acceso denegado', userNotFound: 'Usuario no encontrado', loadSuccess: 'Video cargado', retrySuccess: '¡Conectado!',
    playCount: 'reproducciones', description: 'Un proyecto de página personal con Vue 3 y Go.', projectSource: 'Código fuente',
    projectLink: 'https://github.com/'
  },
  pt: {
    videoTitle: 'Vídeo em destaque', loadingVideo: 'Carregando vídeos...', retry: 'Tentar novamente', noVideos: 'Sem vídeos.',
    connectionError: 'Não é possível conectar. Carregando vídeos de reserva...', rateLimitError: 'Servidor ocupado, tentando novamente...',
    accessDenied: 'Acesso negado', userNotFound: 'Usuário não encontrado', loadSuccess: 'Vídeo carregado', retrySuccess: 'Conectado!',
    playCount: 'exibições', description: 'Um projeto de página pessoal com Vue 3 e Go.', projectSource: 'Código-fonte',
    projectLink: 'https://github.com/'
  },
  ru: {
    videoTitle: 'Видео', loadingVideo: 'Загрузка видео...', retry: 'Повторить', noVideos: 'Нет видео.',
    connectionError: 'Нет соединения. Загрузка резервных видео...', rateLimitError: 'Сервер занят, повтор...',
    accessDenied: 'Доступ запрещён', userNotFound: 'Пользователь не найден', loadSuccess: 'Видео загружено', retrySuccess: 'Подключено!',
    playCount: 'просмотров', description: 'Личный проект на Vue 3 и Go.', projectSource: 'Исходный код',
    projectLink: 'https://github.com/'
  },
  ar: {
    videoTitle: 'فيديو مميز', loadingVideo: 'جاري تحميل الفيديوهات...', retry: 'إعادة المحاولة', noVideos: 'لا توجد فيديوهات.',
    connectionError: 'تعذر الاتصال. جاري تحميل فيديوهات احتياطية...', rateLimitError: 'الخادم مشغول، جاري المحاولة...',
    accessDenied: 'تم رفض الوصول', userNotFound: 'المستخدم غير موجود', loadSuccess: 'تم تحميل الفيديو', retrySuccess: 'متصل!',
    playCount: 'مشاهدة', description: 'مشروع صفحة شخصية باستخدام Vue 3 و Go.', projectSource: 'الكود المصدري',
    projectLink: 'https://github.com/'
  }
};
const { t } = useI18n(translations);

const userId = '165392864';
const videos = ref([]);
const currentVideo = ref(null);
const loading = ref(false);
const error = ref(false);
const errorText = ref('');
const progress = ref(0);

let progressInterval = null;

const fallbackVideos = [
  {
    title: '示例视频 1',
    video: 'https://player.bilibili.com/player.html?bvid=BV1xx411c7mD',
    play: 10000,
    created: '2024-01-01'
  },
  {
    title: '示例视频 2',
    video: 'https://player.bilibili.com/player.html?bvid=BV1GJ411x7h7',
    play: 5000,
    created: '2024-02-01'
  }
];

const isYouTubeUrl = (url) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

const formatPlayCount = (count) => {
  const num = Number(count) || 0;
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return String(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
};

const startProgress = () => {
  progress.value = 0;
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 10;
    }
  }, 300);
};

const stopProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  progress.value = 100;
  setTimeout(() => {
    progress.value = 0;
  }, 500);
};

const loadFallback = () => {
  videos.value = fallbackVideos;
  currentVideo.value = fallbackVideos[0];
  error.value = false;
  loading.value = false;
};

const fetchUserVideos = async () => {
  loading.value = true;
  error.value = false;
  errorText.value = '';
  startProgress();
  try {
    const data = await request.get('/bilibili/user/videos', { params: { mid: userId }, timeout: 15000 });
    const list = data.data?.list || data.list || [];
    if (list.length > 0) {
      videos.value = list;
      currentVideo.value = list[0];
      ElMessage.success(t.value.loadSuccess);
    } else {
      loadFallback();
    }
  } catch (err) {
    error.value = true;
    if (err.response && err.response.status === 403) {
      errorText.value = t.value.accessDenied;
    } else if (err.response && err.response.status === 404) {
      errorText.value = t.value.userNotFound;
    } else {
      errorText.value = t.value.connectionError;
      loadFallback();
    }
  } finally {
    stopProgress();
    loading.value = false;
  }
};

const refreshVideo = () => {
  fetchUserVideos();
};

fetchUserVideos();
</script>

<style scoped>
.video-frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.video-frame iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.about-section {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #ebeef5;
}

.dark .about-section {
  background: rgba(28, 28, 30, 0.6);
  border-color: #363637;
}

.about-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  text-decoration: none;
}

.about-link:hover {
  text-decoration: underline;
}
</style>
