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
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-gray-700 text-md">*******</h4>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loadingVideo" class="text-center py-8">
          <el-icon class="is-loading" :size="32" color="#409eff">
            <Loading />
          </el-icon>
          <p class="text-gray-500 mt-2">{{ loadingMessage }}</p>
          <el-progress 
            v-if="showProgress" 
            :percentage="loadingProgress" 
            :status="loadingProgress === 100 ? 'success' : undefined"
            class="mt-4 max-w-xs mx-auto"
          />
        </div>
        
        <!-- 错误状态 - 自动重试中 -->
        <div v-else-if="videoError && autoRetrying" class="text-center py-8">
          <el-icon class="is-loading" :size="32" color="#e6a23c">
            <Loading />
          </el-icon>
          <p class="text-orange-500 mt-2">{{ videoError }}</p>
          <p class="text-gray-500 text-sm mt-1">{{ t.autoRetryMessage }}</p>
        </div>
        

        <!-- 视频显示 -->
        <div v-else-if="currentVideo" class="video-wrapper">
          <div class="video-info-bar bg-gray-50 p-3 rounded-t-lg flex justify-between items-center">
            <div class="flex items-center gap-2">
              <el-icon color="#409eff"><VideoPlay /></el-icon>
              <span class="text-sm text-gray-700 font-medium truncate max-w-xs">{{ currentVideo.title }}</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ t.playCount }}: {{ formatPlayCount(currentVideo.play) }} | {{ t.uploadTime }}: {{ formatDate(currentVideo.created) }}
            </div>
          </div>
          <iframe
            :src="`https://player.bilibili.com/player.html?bvid=${currentVideo.bvid}&page=1&high_quality=1&danmaku=0`"
            scrolling="no"
            border="0"
            frameborder="no"
            framespacing="0"
            allowfullscreen="true"
            class="bilibili-player"
          ></iframe>
        </div>
        
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';
const { Cloud, Loading, Warning, Refresh, VideoPlay, VideoCamera } = Icons;
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

    loadingVideo: "Loading video...",
    noVideos: "No videos found",
    videoFetchError: "Failed to fetch video, please try again",
    retry: "Retry",
    connectingServer: "Connecting to server...",
    processingData: "Processing data...",
    loadSuccess: "Loading successful!",
    switchingVideo: "Switching video...",
    playCount: "Views",
    uploadTime: "Upload Date",
    noVideoLoaded: "No video loaded yet",
    loadVideo: "Load Videos",
    retrying: "Retrying...",
    accessDenied: "Access denied, possibly due to anti-scraping restrictions",
    userNotFound: "User not found or has been banned",
    serverNotRunning: "Backend server is not running, please start server.js",
    timeout: "Request timeout, please check your network connection",
    checkingServer: "Checking server connection...",
    apiNotFound: "Backend API endpoint not found, please check if server.js is running correctly",
    autoRetryMessage: "Automatically retrying, please wait...",
    connectionError: "Connection failed",
    rateLimitError: "Too many requests, retrying in...",
    autoRetryComplete: "All retry attempts completed. Please try again later.",
    seconds: "seconds"
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

    loadingVideo: "正在加载视频...",
    noVideos: "未找到视频",
    videoFetchError: "获取视频失败，请重试",
    retry: "重试",
    connectingServer: "正在连接服务器...",
    processingData: "正在处理数据...",
    loadSuccess: "加载成功！",
    switchingVideo: "正在切换视频...",
    playCount: "播放量",
    uploadTime: "上传时间",
    noVideoLoaded: "暂未加载视频",
    loadVideo: "加载视频",
    retrying: "正在重试...",
    accessDenied: "访问被拒绝，可能是B站反爬虫限制",
    userNotFound: "用户不存在或已被封禁",
    serverNotRunning: "后端服务器未运行，请启动server.js",
    timeout: "请求超时，请检查网络连接",
    checkingServer: "正在检查服务器连接...",
    apiNotFound: "后端API接口不存在，请检查server.js是否正确运行",
    autoRetryMessage: "正在自动重试，请稍候...",
    connectionError: "连接失败",
    rateLimitError: "请求过于频繁，稍后重试...",
    autoRetryComplete: "所有重试尝试已完成，请稍后再试。",
    seconds: "秒"
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

    loadingVideo: "Chargement de la vidéo...",
    noVideos: "Aucune vidéo trouvée",
    videoFetchError: "Échec du chargement de la vidéo, veuillez réessayer",
    retry: "Réessayer",
    refresh: "Actualiser",
    connectingServer: "Connexion au serveur...",
    processingData: "Traitement des données...",
    loadSuccess: "Chargement réussi !",
    switchingVideo: "Changement de vidéo...",
    playCount: "Vues",
    uploadTime: "Date de Téléchargement",
    noVideoLoaded: "Aucune vidéo chargée",
    loadVideo: "Charger les Vidéos",
    retrying: "Réessayez...",
    accessDenied: "Accès refusé, probablement d'un blocage anti-scraping",
    userNotFound: "Utilisateur introuvable ou banni",
    serverNotRunning: "Le serveur de l'arrière-plan n'est pas en cours d'exécution, veuillez démarrer server.js",
    timeout: "Délai d'attente dépassé, veuillez vérifier votre connexion réseau",
    checkingServer: "Vérification de la connexion au serveur...",
    apiNotFound: "L'endpoint de l'API backend est introuvable, veuillez vérifier que server.js est correctement exécuté",
    autoRetryMessage: "Réessai automatique, veuillez patienter...",
    connectionError: "Échec de la connexion",
    rateLimitError: "Trop de requêtes, réessai dans...",
    autoRetryComplete: "Toutes les tentatives de réessai sont terminées. Veuillez réessayer plus tard.",
    seconds: "secondes"
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

    loadingVideo: "Cargando video...",
    noVideos: "No se encontraron videos",
    videoFetchError: "Error al cargar el video, por favor inténtelo de nuevo",
    retry: "Reintentar",
    refresh: "Actualizar",
    connectingServer: "Conectando al servidor...",
    processingData: "Procesando datos...",
    loadSuccess: "¡Carga exitosa!",
    switchingVideo: "Cambiando video...",
    playCount: "Vistas",
    uploadTime: "Fecha de Subida",
    noVideoLoaded: "No hay videos cargados",
    loadVideo: "Cargar Videos",
    retrying: "Reintentando...",
    accessDenied: "Acceso denegado, posiblemente debido a restricciones anti-scraping",
    userNotFound: "Usuario no encontrado o ha sido baneado",
    serverNotRunning: "El servidor backend no está en funcionamiento, por favor inicia server.js",
    timeout: "Tiempo de espera agotado, por favor verifica tu conexión de red",
    checkingServer: "Verificando la conexión al servidor...",
    apiNotFound: "El endpoint de la API backend no se encontró, por favor verifica si server.js se está ejecutando correctamente",
    autoRetryMessage: "Reintentando automáticamente, por favor espera...",
    connectionError: "Error de conexión",
    rateLimitError: "Demasiadas solicitudes, reintentando en...",
    autoRetryComplete: "Todos los intentos de reintento completados. Por favor intenta más tarde.",
    seconds: "segundos"
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

    loadingVideo: "Carregando vídeo...",
    noVideos: "Nenhum vídeo encontrado",
    videoFetchError: "Falha ao carregar o vídeo, tente novamente",
    retry: "Tentar Novamente",
    refresh: "Atualizar",
    connectingServer: "Conectando ao servidor...",
    processingData: "Processando dados...",
    loadSuccess: "Carregamento com sucesso!",
    switchingVideo: "Trocando vídeo...",
    playCount: "Visualizações",
    uploadTime: "Data de Upload",
    noVideoLoaded: "Nenhum vídeo carregado",
    loadVideo: "Carregar Vídeos",
    retrying: "Repetindo...",
    accessDenied: "Acesso negado, possivelmente devido a restrições anti-scraping",
    userNotFound: "Usuário não encontrado ou foi banido",
    serverNotRunning: "O servidor backend não está em execução, por favor inicie o server.js",
    timeout: "Tempo de solicitação esgotado, por favor verifique sua conexão de rede",
    checkingServer: "Verificando a conexão do servidor...",
    apiNotFound: "O endpoint da API backend não foi encontrado, por favor verifique se o server.js está sendo executado corretamente",
    autoRetryMessage: "Repetindo automaticamente, por favor aguarde...",
    connectionError: "Falha na conexão",
    rateLimitError: "Muitas solicitações, repetindo em...",
    autoRetryComplete: "Todas as tentativas de repetição concluídas. Por favor, tente novamente mais tarde.",
    seconds: "segundos"
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

    loadingVideo: "Загрузка видео...",
    noVideos: "Видео не найдены",
    videoFetchError: "Не удалось загрузить видео, попробуйте снова",
    retry: "Повторить",
    refresh: "Обновить",
    connectingServer: "Подключение к серверу...",
    processingData: "Обработка данных...",
    loadSuccess: "Загрузка успешна!",
    switchingVideo: "Переключение видео...",
    playCount: "Просмотры",
    uploadTime: "Дата Загрузки",
    noVideoLoaded: "Видео не загружено",
    loadVideo: "Загрузить Видео",
    retrying: "Повторная попытка...",
    accessDenied: "Доступ запрещён, возможно из-за ограничений анти-скрапинга",
    userNotFound: "Пользователь не найден или был забанен",
    serverNotRunning: "Сервер не запущен, пожалуйста, запустите server.js",
    timeout: "Время запроса истекло, пожалуйста, проверьте свою сетевую подключение",
    checkingServer: "Проверка соединения с сервером...",
    apiNotFound: "API endpoint не найден, пожалуйста, проверьте, правильно ли запущен server.js",
    autoRetryMessage: "Автоматический повтор, пожалуйста, подождите...",
    connectionError: "Сбой соединения",
    rateLimitError: "Слишком много запросов, повторная попытка через...",
    autoRetryComplete: "Все попытки повтора завершены. Пожалуйста, попробуйте позже.",
    seconds: "секунд"
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

    loadingVideo: "جاري تحميل الفيديو...",
    noVideos: "لم يتم العثور على فيديوهات",
    videoFetchError: "فشل في تحميل الفيديو، يرجى المحاولة مرة أخرى",
    retry: "إعادة المحاولة",
    refresh: "تحديث",
    connectingServer: "جاري الاتصال بالخادم...",
    processingData: "جاري معالجة البيانات...",
    loadSuccess: "تم التحميل بنجاح!",
    switchingVideo: "جاري تغيير الفيديو...",
    playCount: "المشاهدات",
    uploadTime: "تاريخ الرفع",
    noVideoLoaded: "لم يتم تحميل فيديو",
    loadVideo: "تحميل الفيديوهات",
    retrying: "جاري إعادة المحاولة...",
    accessDenied: "تم رفض الوصول، ربما بسبب قيود مكافحة الكشط",
    userNotFound: "المستخدم غير موجود أو تم حظره",
    serverNotRunning: "الخادم الخلفي غير قيد التشغيل، يرجى تشغيل server.js",
    timeout: "انتهت مهلة الطلب، يرجى التحقق من اتصالك بالشبكة",
    checkingServer: "جاري التحقق من اتصال الخادم...",
    apiNotFound: "نقطة نهاية API غير موجودة، يرجى التحقق من تشغيل server.js بشكل صحيح",
    autoRetryMessage: "جاري إعادة المحاولة تلقائيًا، يرجى الانتظار...",
    connectionError: "فشل الاتصال",
    rateLimitError: "طلبات كثيرة جدًا، إعادة المحاولة خلال...",
    autoRetryComplete: "تمت جميع محاولات إعادة المحاولة. يرجى المحاولة مرة أخرى لاحقًا.",
    seconds: "ثانية"
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
const loadingMessage = ref('');
const loadingProgress = ref(0);
const showProgress = ref(false);
const autoRetrying = ref(false); // 是否正在自动重试

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

// 检查后端服务器连接
const checkServerConnection = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/health', {
      timeout: 3000
    });
    console.log('服务器连接正常:', response.data);
    return true;
  } catch (err) {
    console.error('服务器连接失败:', err.message);
    return false;
  }
};

// 获取用户视频列表（带自动重试）
const fetchUserVideos = async (retryCount = 99) => {
  loadingVideo.value = true;
  videoError.value = '';
  autoRetrying.value = false;
  loadingMessage.value = t.value.checkingServer || '正在检查服务器连接...';
  loadingProgress.value = 0;
  showProgress.value = true;
  
  // 首先检查服务器是否运行
  const serverConnected = await checkServerConnection();
  if (!serverConnected) {
    videoError.value = t.value.serverNotRunning || '后端服务器未运行，请启动server.js';
    showProgress.value = false;
    loadingVideo.value = false;
    return;
  }
  
      loadingMessage.value = t.value.connectingServer || '正在连接服务器...';
      loadingProgress.value = Math.round(((attempt - 1) / retryCount) * 100); // 根据重试次数设置进度
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    let progressInterval;
    try {
      console.log(`尝试获取视频 (第${attempt}/${retryCount}次)`);
      loadingMessage.value = attempt > 1 
        ? `${t.value.retrying || '正在重试...'} (${attempt}/${retryCount})`
        : (t.value.connectingServer || '正在连接服务器...');
      
      // 根据当前重试次数更新进度
      loadingProgress.value = Math.round((attempt / retryCount) * 100);

      // 使用后端服务器代理调用B站API获取用户视频列表
      const response = await axios.get(`http://localhost:8080/api/bilibili/user/videos`, {
        params: {
          mid: userId
        },
        timeout: 25000,
        validateStatus: function (status) {
          return status >= 200 && status < 600; // 接受所有状态码，手动处理错误
        }
      });

      clearInterval(progressInterval);
      console.log('收到响应:', response.status, response.data);

      // 检查响应状态 - 404错误不应该重试，立即返回
      if (response.status === 404) {
        throw new Error(`HTTP 404: ${response.data?.message || response.data?.error || '接口不存在'}`);
      }
      
      // 403错误也不应该重试
      if (response.status === 403) {
        throw new Error(`HTTP 403: ${response.data?.message || response.data?.error || '访问被拒绝'}`);
      }
      
      // 412错误是B站反爬虫限制，可以重试
      if (response.status === 412) {
        throw new Error(`HTTP 412: ${response.data?.message || response.data?.error || '请求被限制'} 可重试`);
      }

      // 5xx错误可以重试
      if (response.status >= 500) {
        throw new Error(`HTTP ${response.status}: 服务器错误，正在重试...`);
      }

      loadingProgress.value = 90;
      loadingMessage.value = t.value.processingData || '正在处理数据...';

      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟处理延迟
      loadingProgress.value = 100;

      // 检查B站API返回的错误码
      if (response.data.code === -799) {
        // 请求过于频繁，可以重试
        throw new Error('请求过于频繁，请稍后再试');
      }

      if (response.data.code === 0 && response.data.data?.list?.vlist?.length > 0) {
        userVideos.value = response.data.data.list.vlist;
        // 随机选择一个视频
        const randomIndex = Math.floor(Math.random() * userVideos.value.length);
        currentVideo.value = userVideos.value[randomIndex];
        loadingMessage.value = t.value.loadSuccess || '加载成功！';
        autoRetrying.value = false;
        loadingProgress.value = 100; // 成功时进度为100%
        
        setTimeout(() => {
          loadingVideo.value = false;
          showProgress.value = false;
          loadingProgress.value = 0;
        }, 800);
        return; // 成功则退出
      } else {
        videoError.value = response.data.message || (t.value.noVideos || '未找到视频');
        showProgress.value = false;
        loadingVideo.value = false;
        autoRetrying.value = false;
        loadingProgress.value = 0;
        return;
      }
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      console.error(`获取视频失败 (第${attempt}次尝试):`, err);
      
      // 检查是否是不可重试的错误
      const isNonRetryableError = 
        err.message?.includes('HTTP 404') ||
        err.message?.includes('HTTP 403') ||
        err.message?.includes('接口不存在') ||
        err.message?.includes('访问被拒绝') ||
        (err.message?.includes('HTTP 412') && !err.message?.includes('可重试'));
      
      if (isNonRetryableError) {
        // 不可重试的错误，立即返回
        let errorMessage = err.message;
        if (err.message?.includes('HTTP 404')) {
          errorMessage = t.value.apiNotFound || '后端API接口不存在，请检查server.js是否正确运行';
        } else if (err.message?.includes('HTTP 403')) {
          errorMessage = t.value.accessDenied || '访问被拒绝，可能是B站反爬虫限制';
        } else if (err.message?.includes('HTTP 412') || err.message?.includes('request was banned')) {
          errorMessage = t.value.accessDenied || '请求已被限制，请稍后再试';
        }
        
        videoError.value = errorMessage;
        autoRetrying.value = false;
        showProgress.value = false;
        
        setTimeout(() => {
          loadingVideo.value = false;
          loadingProgress.value = 0;
        }, 800);
        return;
      }
      
      // 如果不是最后一次尝试，设置自动重试状态
      if (attempt < retryCount) {
        autoRetrying.value = true;
        // 随机等待时间：5-10秒
        const waitTime = Math.floor(Math.random() * 5000) + 5000;
        const waitSeconds = Math.round(waitTime / 1000);
        console.log(`等待 ${waitSeconds} 秒后重试...`);
        
        videoError.value = `${t.value.rateLimitError || '请求过于频繁，稍后重试...'} ${waitSeconds}${t.value.seconds || '秒'}`;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        videoError.value = ''; // 清除错误信息，继续重试
        continue;
      }
      
      // 如果是最后一次尝试，设置错误信息
      if (attempt === retryCount) {
        autoRetrying.value = false;
        videoError.value = t.value.autoRetryComplete || '所有重试尝试已完成，请稍后再试。';
        showProgress.value = false;
        
        setTimeout(() => {
          loadingVideo.value = false;
          loadingProgress.value = 0;
        }, 800);
        return;
      }
    }
  }
};

// 刷新视频（选择新的随机视频）- 内部使用，不暴露给用户
const refreshVideo = async () => {
  if (userVideos.value.length > 1) {
    // 如果已加载视频列表，直接从列表中选择新的随机视频
    loadingVideo.value = true;
    loadingMessage.value = t.value.switchingVideo || '正在切换视频...';
    
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟切换延迟
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * userVideos.value.length);
    } while (newIndex === userVideos.value.indexOf(currentVideo.value) && userVideos.value.length > 1);
    
    currentVideo.value = userVideos.value[newIndex];
    loadingVideo.value = false;
  } else {
    // 如果没有视频列表或只有一个视频，重新获取
    await fetchUserVideos();
  }
};

// 格式化播放量
const formatPlayCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
};

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

.video-info-bar {
  border-bottom: 1px solid #e5e7eb;
}

.video-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>