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

      <div v-if="loading" class="text-gray-500 dark:text-gray-400 font-mono text-xl">
        {{ t.loadingIP }}
      </div>
      <div v-else-if="error" class="text-red-500 dark:text-red-400 font-mono text-xl">
        {{ t.errorIP }}
      </div>
      <div v-else>
        <p class="text-gray-600 dark:text-gray-400 font-mono">{{ t.yourIP }}</p>
        <div class="flex items-center justify-center gap-2 mt-2">
          <span class="text-blue-600 dark:text-blue-400 font-mono text-xl">{{ ip }}</span>
          <el-button size="small" circle @click="copyIP" :type="copied ? 'success' : 'default'">
            <el-icon>
              <Check v-if="copied" />
              <CopyDocument v-else />
            </el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 天气卡片 -->
    <el-card class="mt-4 max-w-md mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <el-icon color="#409eff"><Sunny /></el-icon>
            <span>{{ t.weatherTitle }}</span>
          </span>
          <el-button v-if="weather" size="small" text @click="fetchWeather">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>
      <div v-if="weatherLoading" class="flex items-center justify-center gap-2 py-4 text-gray-500 dark:text-gray-400">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ t.weatherLoading }}</span>
      </div>
      <div v-else-if="weatherError" class="text-center py-4 text-red-500 dark:text-red-400">
        {{ t.weatherError }}
      </div>
      <div v-else-if="weather" class="flex items-center justify-between py-1">
        <div class="flex items-center gap-4">
          <img :src="weather.icon" :alt="weather.desc" class="w-14 h-14" />
          <div>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-200">{{ weather.temp }}</span>
              <span class="text-gray-500 dark:text-gray-400">°C</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ weather.desc }}</p>
          </div>
        </div>
        <div class="text-right text-sm text-gray-500 dark:text-gray-400">
          <p class="mb-1"><el-icon :size="14"><Location /></el-icon> {{ weather.area }}</p>
          <p class="mb-1">💧 {{ t.humidity }}: {{ weather.humidity }}%</p>
          <p>🌬 {{ t.windSpeed }}: {{ weather.wind }} km/h</p>
        </div>
      </div>
    </el-card>

    <!-- 常用链接卡片 -->
    <el-card class="mt-4 max-w-2xl mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <el-icon color="#409eff"><Link /></el-icon>
            <span>{{ t.linksTitle }}</span>
          </span>
          <el-button size="small" type="primary" @click="showAddLinkDialog = true">
            <el-icon><Plus /></el-icon>
            <span>{{ t.addLink }}</span>
          </el-button>
        </div>
      </template>

      <div v-if="links.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">
        {{ t.emptyLinks }}
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="(item, index) in links"
          :key="item.id"
          class="link-item group relative flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:shadow-md transition-all cursor-pointer"
          @click="openLink(item.url)"
        >
          <div
            class="flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm shrink-0"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">{{ item.name }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ item.host }}</p>
          </div>
          <el-button
            size="small"
            text
            circle
            class="opacity-0 group-hover:opacity-100 transition-opacity !ml-0"
            @click.stop="removeLink(index)"
          >
            <el-icon color="#f56c6c"><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 添加链接对话框 -->
    <el-dialog
      v-model="showAddLinkDialog"
      :title="t.addLink"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top" @submit.prevent="confirmAddLink">
        <el-form-item :label="t.linkName">
          <el-input v-model="newLink.name" :placeholder="t.linkNamePlaceholder" maxlength="30" />
        </el-form-item>
        <el-form-item :label="t.linkUrl">
          <el-input v-model="newLink.url" :placeholder="t.linkUrlPlaceholder" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddLinkDialog = false">{{ t.cancel }}</el-button>
        <el-button type="primary" @click="confirmAddLink">{{ t.confirmAdd }}</el-button>
      </template>
    </el-dialog>

    <!-- 每日一言卡片 -->
    <el-card class="mt-4 max-w-md mx-auto">
      <div class="flex items-start gap-3">
        <el-icon color="#e6a23c" :size="22"><ChatLineSquare /></el-icon>
        <div class="flex-1 min-w-0">
          <div v-if="quoteLoading" class="py-2 text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>{{ t.quoteLoading }}</span>
          </div>
          <div v-else-if="quote" class="py-1">
            <p class="text-gray-700 dark:text-gray-300 text-base leading-relaxed">「{{ quote.text }}」</p>
            <p v-if="quote.from" class="mt-2 text-right text-sm text-gray-400 dark:text-gray-500">—— {{ quote.from }}</p>
          </div>
        </div>
        <el-button size="small" text circle @click="fetchQuote" title="刷新">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </el-card>

    <!-- 访客计数器和时间 -->
    <div class="flex justify-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
      <div class="flex items-center gap-1">
        <el-icon><View /></el-icon>
        <span>{{ t.visitorCount }}: {{ visitorCount }}</span>
      </div>
      <div class="flex items-center gap-1">
        <el-icon><Clock /></el-icon>
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="flex justify-center mt-10">
      <el-icon :size="60" color="#3b82f6" :opacity="0.8">
        <component :is="Cloud" />
      </el-icon>
    </div>

    <!-- 添加的文本和超链接 -->
    <div class="additional-content mt-8">
      <h3 class="text-gray-800 dark:text-gray-200 text-lg mb-4">关于项目</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ t.description }}</p>
      <div class="links mb-6">
        <a href="https://space.bilibili.com/165392864" target="_blank" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4">
          {{ t.link}}
        </a>
      </div>
      
      <!-- 视频内嵌区域 -->
      <div class="video-container">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-gray-700 dark:text-gray-300 text-md">*******</h4>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loadingVideo" class="text-center py-8">
          <el-icon class="is-loading" :size="32" color="#409eff">
            <Loading />
          </el-icon>
          <p class="text-gray-500 dark:text-gray-400 mt-2">{{ loadingMessage }}</p>
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
          <p class="text-orange-500 dark:text-orange-400 mt-2">{{ videoError }}</p>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ t.autoRetryMessage }}</p>
        </div>
        

        <!-- 视频显示 -->
        <div v-else-if="currentVideo" class="video-wrapper">
          <div class="video-info-bar bg-gray-50 dark:bg-gray-800 p-3 rounded-t-lg flex justify-between items-center">
            <div class="flex items-center gap-2">
              <el-icon color="#409eff"><VideoPlay /></el-icon>
              <span class="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-xs">{{ currentVideo.title }}</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';
const { Cloud, Loading, Warning, Refresh, VideoPlay, VideoCamera, Check, CopyDocument, View, Clock, Sunny, Location, Link, Plus, Close, ChatLineSquare } = Icons;
import { ElIcon, ElButton, ElSelect, ElOption, ElMessage, ElMessageBox } from 'element-plus';
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
    visitorCount: "Visitors",
    loadingIP: "Loading IP address...",
    errorIP: "Failed to fetch IP. Please try again.",
    link: "Follow the streamer Thank You Meow",

    weatherTitle: "Weather",
    weatherLoading: "Fetching weather...",
    weatherError: "Failed to fetch weather",
    humidity: "Humidity",
    windSpeed: "Wind",

    linksTitle: "Quick Links",
    addLink: "Add Link",
    linkName: "Name",
    linkUrl: "URL",
    confirmAdd: "Add",
    cancel: "Cancel",
    deleteConfirm: "Delete this link?",
    linkNamePlaceholder: "Enter link name",
    linkUrlPlaceholder: "Enter URL (e.g. https://...)",
    emptyLinks: "No links yet, click \"Add Link\" to create one",
    addLinkEmptyName: "Please enter name and URL",
    addLinkSuccess: "Link added",
    linkDeleted: "Link deleted",

    quoteLoading: "Loading quote...",

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
    visitorCount: "访客",
    loadingIP: "正在加载 IP 地址...",
    errorIP: "获取 IP 失败，请重试。",
    link: "关注主播谢谢喵",

    weatherTitle: "天气",
    weatherLoading: "天气获取中...",
    weatherError: "天气获取失败",
    humidity: "湿度",
    windSpeed: "风速",

    linksTitle: "常用链接",
    addLink: "添加链接",
    linkName: "名称",
    linkUrl: "链接地址",
    confirmAdd: "添加",
    cancel: "取消",
    deleteConfirm: "确定删除该链接？",
    linkNamePlaceholder: "请输入链接名称",
    linkUrlPlaceholder: "请输入网址（如 https://...）",
    emptyLinks: "暂无链接，点击「添加链接」创建一个",
    addLinkEmptyName: "请输入名称和链接地址",
    addLinkSuccess: "链接已添加",
    linkDeleted: "链接已删除",

    quoteLoading: "一言加载中...",

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
    visitorCount: "Visiteurs",
    loadingIP: "Chargement de l'adresse IP...",
    errorIP: "Échec de la récupération de l'IP. Veuillez réessayer.",
    link: "Suivez le streamer Merci Miaou",

    weatherTitle: "Météo",
    weatherLoading: "Chargement de la météo...",
    weatherError: "Échec de la récupération de la météo",
    humidity: "Humidité",
    windSpeed: "Vent",

    linksTitle: "Liens rapides",
    addLink: "Ajouter un lien",
    linkName: "Nom",
    linkUrl: "URL",
    confirmAdd: "Ajouter",
    cancel: "Annuler",
    deleteConfirm: "Supprimer ce lien ?",
    linkNamePlaceholder: "Entrez le nom du lien",
    linkUrlPlaceholder: "Entrez l'URL (ex : https://...)",
    emptyLinks: "Aucun lien, cliquez sur \"Ajouter un lien\" pour en créer un",
    addLinkEmptyName: "Veuillez saisir le nom et l'URL",
    addLinkSuccess: "Lien ajouté",
    linkDeleted: "Lien supprimé",

    quoteLoading: "Chargement de la citation...",

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
    visitorCount: "Visitantes",
    loadingIP: "Cargando dirección IP...",
    errorIP: "Error al obtener la IP. Por favor, inténtalo de nuevo.",
    link: "Sigue al streamer Gracias Miau",

    weatherTitle: "Clima",
    weatherLoading: "Cargando clima...",
    weatherError: "Error al obtener el clima",
    humidity: "Humedad",
    windSpeed: "Viento",

    linksTitle: "Enlaces rápidos",
    addLink: "Agregar enlace",
    linkName: "Nombre",
    linkUrl: "URL",
    confirmAdd: "Agregar",
    cancel: "Cancelar",
    deleteConfirm: "¿Eliminar este enlace?",
    linkNamePlaceholder: "Ingrese el nombre del enlace",
    linkUrlPlaceholder: "Ingrese la URL (ej. https://...)",
    emptyLinks: "Sin enlaces, haga clic en \"Agregar enlace\" para crear uno",
    addLinkEmptyName: "Ingrese el nombre y la URL",
    addLinkSuccess: "Enlace agregado",
    linkDeleted: "Enlace eliminado",

    quoteLoading: "Cargando cita...",

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
    visitorCount: "Visitantes",
    loadingIP: "Carregando endereço IP...",
    errorIP: "Falha ao obter o IP. Por favor, tente novamente.",
    link: "Siga o streamer Obrigado Miau",

    weatherTitle: "Clima",
    weatherLoading: "Carregando clima...",
    weatherError: "Falha ao obter o clima",
    humidity: "Umidade",
    windSpeed: "Vento",

    linksTitle: "Links rápidos",
    addLink: "Adicionar link",
    linkName: "Nome",
    linkUrl: "URL",
    confirmAdd: "Adicionar",
    cancel: "Cancelar",
    deleteConfirm: "Excluir este link?",
    linkNamePlaceholder: "Digite o nome do link",
    linkUrlPlaceholder: "Digite a URL (ex: https://...)",
    emptyLinks: "Sem links, clique em \"Adicionar link\" para criar um",
    addLinkEmptyName: "Digite o nome e a URL",
    addLinkSuccess: "Link adicionado",
    linkDeleted: "Link excluído",

    quoteLoading: "Carregando citação...",

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
    visitorCount: "Посетители",
    loadingIP: "Загрузка IP-адреса...",
    errorIP: "Не удалось получить IP. Пожалуйста, попробуйте снова.",
    link: "Следите за стримером Спасибо Мяу",

    weatherTitle: "Погода",
    weatherLoading: "Загрузка погоды...",
    weatherError: "Не удалось получить погоду",
    humidity: "Влажность",
    windSpeed: "Ветер",

    linksTitle: "Быстрые ссылки",
    addLink: "Добавить ссылку",
    linkName: "Название",
    linkUrl: "URL",
    confirmAdd: "Добавить",
    cancel: "Отмена",
    deleteConfirm: "Удалить эту ссылку?",
    linkNamePlaceholder: "Введите название ссылки",
    linkUrlPlaceholder: "Введите URL (напр. https://...)",
    emptyLinks: "Нет ссылок, нажмите «Добавить ссылку», чтобы создать",
    addLinkEmptyName: "Введите название и URL",
    addLinkSuccess: "Ссылка добавлена",
    linkDeleted: "Ссылка удалена",

    quoteLoading: "Загрузка цитаты...",

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
    visitorCount: "الزوار",
    loadingIP: "جاري تحميل عنوان IP...",
    errorIP: "فشل في جلب عنوان IP. يرجى المحاولة مرة أخرى.",
    link: "تابع الستريمر شكراً مياو",

    weatherTitle: "الطقس",
    weatherLoading: "جارٍ تحميل الطقس...",
    weatherError: "فشل في الحصول على الطقس",
    humidity: "الرطوبة",
    windSpeed: "الرياح",

    linksTitle: "روابط سريعة",
    addLink: "إضافة رابط",
    linkName: "الاسم",
    linkUrl: "الرابط",
    confirmAdd: "إضافة",
    cancel: "إلغاء",
    deleteConfirm: "حذف هذا الرابط؟",
    linkNamePlaceholder: "أدخل اسم الرابط",
    linkUrlPlaceholder: "أدخل الرابط (مثل: https://...)",
    emptyLinks: "لا توجد روابط، انقر فوق «إضافة رابط» لإنشاء واحدة",
    addLinkEmptyName: "يرجى إدخال الاسم والرابط",
    addLinkSuccess: "تمت إضافة الرابط",
    linkDeleted: "تم حذف الرابط",

    quoteLoading: "جارٍ تحميل الاقتباس...",

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

// 根据IP判断地区，设置默认语言
const detectLanguageByIP = (ipAddress) => {
  if (!ipAddress) return 'en';
  
  // 中国大陆IP段判断（简单判断）
  if (/^1\d{2}\./.test(ipAddress) || 
      /^2[0-4]\d\./.test(ipAddress) || 
      /^25[0-5]\./.test(ipAddress) ||
      ipAddress.startsWith('114.') ||
      ipAddress.startsWith('223.') ||
      ipAddress.startsWith('183.') ||
      ipAddress.startsWith('123.')) {
    return 'zh';
  }
  
  // 港澳台IP
  if (ipAddress.startsWith('202.') || 
      ipAddress.startsWith('203.') ||
      ipAddress.startsWith('210.') ||
      ipAddress.startsWith('218.')) {
    return 'zh';
  }
  
  return 'en';
};
const ip = ref('');
const loading = ref(false);
const error = ref(false);
const copied = ref(false);

// 天气
const weather = ref(null);
const weatherLoading = ref(false);
const weatherError = ref(false);

const fetchWeather = async () => {
  weatherLoading.value = true;
  weatherError.value = false;
  try {
    // 使用 wttr.in 免费天气 API，根据请求来源 IP 自动定位，无需 key
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch('https://wttr.in/?format=j1', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error('weather request failed');
    const data = await response.json();

    const current = data.current_condition?.[0];
    const area = data.nearest_area?.[0];
    if (!current) throw new Error('no weather data');

    const desc = current.lang_zh?.[0]?.value || current.weatherDesc?.[0]?.value || '';
    weather.value = {
      temp: current.temp_C,
      desc,
      humidity: current.humidity,
      wind: current.windspeedKmph,
      icon: current.weatherIconUrl?.[0]?.value || '',
      area: area ? `${area.areaName?.[0]?.value || ''} ${area.country?.[0]?.value || ''}`.trim() : ''
    };
  } catch {
    weatherError.value = true;
  } finally {
    weatherLoading.value = false;
  }
};

// 常用链接
const LINKS_STORAGE_KEY = 'quick_links';
const linkColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6', '#2ecc71', '#e67e22', '#1abc9c', '#3498db'];

const defaultLinks = [
  { name: 'Bilibili', url: 'https://www.bilibili.com', color: '#fb7299' },
  { name: 'GitHub', url: 'https://github.com', color: '#181717' },
  { name: 'Google', url: 'https://www.google.com', color: '#4285f4' },
  { name: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000' }
];

const links = ref([]);
const showAddLinkDialog = ref(false);
const newLink = ref({ name: '', url: '' });

const getHost = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const loadLinks = () => {
  try {
    const saved = localStorage.getItem(LINKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        links.value = parsed.map(item => ({
          ...item,
          host: getHost(item.url)
        }));
        return;
      }
    }
  } catch (e) {
    console.warn('读取常用链接失败:', e);
  }
  // 无数据时使用默认链接
  links.value = defaultLinks.map(item => ({
    ...item,
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    host: getHost(item.url)
  }));
  saveLinks();
};

const saveLinks = () => {
  try {
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links.value));
  } catch (e) {
    console.warn('保存常用链接失败:', e);
  }
};

const openLink = (url) => {
  const fullUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  window.open(fullUrl, '_blank', 'noopener');
};

const confirmAddLink = () => {
  const name = newLink.value.name.trim();
  let url = newLink.value.url.trim();
  if (!name || !url) {
    ElMessage.warning(t.value.addLinkEmptyName || '请输入名称和链接');
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  links.value.push({
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    url,
    host: getHost(url),
    color: linkColors[links.value.length % linkColors.length]
  });
  saveLinks();
  showAddLinkDialog.value = false;
  newLink.value = { name: '', url: '' };
  ElMessage.success(t.value.addLinkSuccess || '链接已添加');
};

const removeLink = (index) => {
  ElMessageBox.confirm(t.value.deleteConfirm, t.value.cancel, {
    confirmButtonText: t.value.confirmAdd,
    cancelButtonText: t.value.cancel,
    type: 'warning'
  })
    .then(() => {
      links.value.splice(index, 1);
      saveLinks();
      ElMessage.success(t.value.linkDeleted || '链接已删除');
    })
    .catch(() => {});
};

// 每日一言
const quote = ref(null);
const quoteLoading = ref(false);

// 本地兜底词库
const localQuotes = [
  { text: '世上无难事，只怕有心人。', from: '中国谚语' },
  { text: '不积跬步，无以至千里。', from: '《荀子·劝学》' },
  { text: '千里之行，始于足下。', from: '《道德经》' },
  { text: '学而不思则罔，思而不学则殆。', from: '《论语》' },
  { text: '天行健，君子以自强不息。', from: '《周易》' },
  { text: 'Stay hungry, stay foolish.', from: 'Steve Jobs' },
  { text: 'The only way to do great work is to love what you do.', from: 'Steve Jobs' },
  { text: 'It always seems impossible until it is done.', from: 'Nelson Mandela' },
  { text: 'Believe you can and you are halfway there.', from: 'Theodore Roosevelt' },
  { text: '不要因为走得太远，而忘记为什么出发。', from: '纪伯伦' },
  { text: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', from: '《阿甘正传》' },
  { text: '真正的勇气，是看清生活的真相之后，依然热爱生活。', from: '罗曼·罗兰' }
];

const fetchQuote = async () => {
  quoteLoading.value = true;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://v1.hitokoto.cn/?encode=json', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error('quote request failed');
    const data = await response.json();
    quote.value = {
      text: data.hitokoto,
      from: data.from || ''
    };
  } catch {
    // API 失败时从本地词库随机取一条
    const item = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    quote.value = { ...item };
  } finally {
    quoteLoading.value = false;
  }
};

// 访客计数和当前时间
const visitorCount = ref(0);
const currentTime = ref('');

const updateVisitorCount = () => {
  const count = localStorage.getItem('visitor_count') || '0';
  const newCount = parseInt(count) + 1;
  localStorage.setItem('visitor_count', newCount.toString());
  visitorCount.value = newCount;
};

let timerInterval = null;
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString();
};

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

// 预准备的BV号列表（备用视频）
const fallbackVideos = [
  { bvid: 'BV12gNTz4E5k', title: 'Bilibili', play: 99999999, created: 1609459200 },
  { bvid: 'BV1Mv4y157k3', title: 'Bilibili', play: 100000, created: 1640995200 },
  { bvid: 'BV1Dg4y1M7QE', title: 'Bilibili', play: 50000, created: 1672531200 }
];

const getIP = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ip.value = data.ip;
    
    // 根据IP自动检测语言
    language.value = detectLanguageByIP(data.ip);
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const copyIP = async () => {
  try {
    await navigator.clipboard.writeText(ip.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = ip.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};

onMounted(() => {
  getIP();
  fetchUserVideos();
  fetchWeather();
  loadLinks();
  fetchQuote();
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

// 获取用户视频列表（取消重试，失败使用备用视频）
const fetchUserVideos = async () => {
  loadingVideo.value = true;
  videoError.value = '';
  autoRetrying.value = false;
  loadingMessage.value = t.value.checkingServer || '正在检查服务器连接...';
  loadingProgress.value = 0;
  showProgress.value = true;
  
  try {
    // 首先检查服务器是否运行
    const serverConnected = await checkServerConnection();
    if (!serverConnected) {
      console.log('服务器未连接，使用备用视频');
      // 服务器未连接，使用备用视频
      const randomFallback = fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];
      currentVideo.value = randomFallback;
      loadingMessage.value = '使用备用视频';
      
      setTimeout(() => {
        loadingVideo.value = false;
        showProgress.value = false;
        loadingProgress.value = 0;
      }, 800);
      return;
    }
    
    loadingMessage.value = t.value.connectingServer || '正在连接服务器...';
    loadingProgress.value = 50;
    
    // 使用后端服务器代理调用B站API获取用户视频列表
    const response = await axios.get(`http://localhost:8080/api/bilibili/user/videos`, {
      params: {
        mid: userId
      },
      timeout: 25000,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    });

    console.log('收到响应:', response.status, response.data);

    // 检查B站API返回的错误码
    if (response.data.code === -799 || response.data.code === -352) {
      throw new Error(`B站风控限制 (错误码: ${response.data.code})`);
    }

    loadingProgress.value = 90;
    loadingMessage.value = t.value.processingData || '正在处理数据...';

    if (response.data.code === 0 && response.data.data?.list?.vlist?.length > 0) {
      userVideos.value = response.data.data.list.vlist;
      const randomIndex = Math.floor(Math.random() * userVideos.value.length);
      currentVideo.value = userVideos.value[randomIndex];
      loadingMessage.value = t.value.loadSuccess || '加载成功！';
      loadingProgress.value = 100;
      
      setTimeout(() => {
        loadingVideo.value = false;
        showProgress.value = false;
        loadingProgress.value = 0;
      }, 800);
    } else {
      throw new Error('未找到视频');
    }
  } catch (err) {
    console.error('获取视频失败，使用备用视频:', err.message);
    
    // 失败时使用备用视频
    const randomFallback = fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];
    currentVideo.value = randomFallback;
    loadingMessage.value = 'API请求失败，使用备用视频';
    loadingProgress.value = 100;
    
    setTimeout(() => {
      loadingVideo.value = false;
      showProgress.value = false;
      loadingProgress.value = 0;
    }, 800);
  }
};

/*
// 带重试的获取用户视频列表（已注释）
const fetchUserVideosWithRetry = async (retryCount = 99) => {
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
  loadingProgress.value = 0; // 初始进度为0
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`尝试获取视频 (第${attempt}/${retryCount}次)`);
      loadingMessage.value = attempt > 1 
        ? `${t.value.retrying || '正在重试...'} (${attempt}/${retryCount}) - 等待风控解除`
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
      if (response.data.code === -799 || response.data.code === -352) {
        // 请求过于频繁或风控，可以重试
        throw new Error(`B站风控限制 (错误码: ${response.data.code})`);
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
*/

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

onMounted(() => {
  updateVisitorCount();
  updateTime();
  timerInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
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