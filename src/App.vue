<template>
  <div class="app-container">
    <router-link to="/" class="home-link">
      <el-icon><HomeFilled /></el-icon>
      <span>{{ navHome }}</span>
    </router-link>
    <div class="theme-toggle" @click="settingsVisible = true" title="设置">
      <el-icon :size="18"><Setting /></el-icon>
    </div>
    <router-view v-slot="{ Component }" class="router-view">
      <transition name="page-fade-slide" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>

    <!-- 设置面板 -->
    <el-drawer
      v-model="settingsVisible"
      :title="settingsTitle"
      size="340px"
      :append-to-body="false"
    >
      <!-- 主题设置 -->
      <h4 class="settings-group-title">{{ themeGroupTitle }}</h4>
      <el-radio-group v-model="themeMode" class="settings-radio-group" @change="applyTheme">
        <el-radio value="light" class="settings-radio">
          <el-icon><Sunny /></el-icon>
          <span>{{ lightLabel }}</span>
        </el-radio>
        <el-radio value="dark" class="settings-radio">
          <el-icon><Moon /></el-icon>
          <span>{{ darkLabel }}</span>
        </el-radio>
        <el-radio value="system" class="settings-radio">
          <el-icon><Monitor /></el-icon>
          <span>{{ systemLabel }}</span>
        </el-radio>
      </el-radio-group>

      <!-- 语言设置 -->
      <h4 class="settings-group-title" style="margin-top: 24px">{{ langGroupTitle }}</h4>
      <el-select v-model="language" class="w-full" @change="changeLanguage">
        <el-option label="English" value="en" />
        <el-option label="中文" value="zh" />
        <el-option label="Français" value="fr" />
        <el-option label="Español" value="es" />
        <el-option label="Português" value="pt" />
        <el-option label="Русский" value="ru" />
        <el-option label="العربية" value="ar" />
      </el-select>
    </el-drawer>
    <transition name="fade">
      <div
        v-show="showBackTop"
        class="back-top-btn"
        @click="scrollToTop"
      >
        <el-icon :size="20"><Top /></el-icon>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { HomeFilled, Top, Sunny, Moon, Monitor, Setting } from '@element-plus/icons-vue';
import { language, setLanguage } from './composables/useI18n';

const showBackTop = ref(false);
const settingsVisible = ref(false);

// ===== 主题设置（亮色 / 暗色 / 跟随系统）=====
const LIGHT = 'light';
const DARK = 'dark';
const SYSTEM = 'system';

const savedMode = localStorage.getItem('theme_mode') || localStorage.getItem('theme') || LIGHT;
const themeMode = ref(['light', 'dark'].includes(savedMode) ? savedMode : LIGHT);

const isDark = computed(() => {
  if (themeMode.value === DARK) return true;
  if (themeMode.value === SYSTEM) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
});

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme_mode', themeMode.value);
};

// 监听系统主题变化（仅跟随系统模式时生效）
const systemDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');
const handleSystemThemeChange = () => {
  if (themeMode.value === SYSTEM) applyTheme();
};

// ===== 语言设置（共享状态，与首页各模块联动）=====
const changeLanguage = (val) => {
  setLanguage(val);
};

// ===== 设置面板文案 =====
const settingsTexts = {
  en: { title: 'Settings', theme: 'Theme', lang: 'Language', light: 'Light', dark: 'Dark', system: 'System', home: 'Home' },
  zh: { title: '设置', theme: '主题', lang: '语言', light: '亮色', dark: '暗色', system: '跟随系统', home: '首页' },
  fr: { title: 'Paramètres', theme: 'Thème', lang: 'Langue', light: 'Clair', dark: 'Sombre', system: 'Système', home: 'Accueil' },
  es: { title: 'Ajustes', theme: 'Tema', lang: 'Idioma', light: 'Claro', dark: 'Oscuro', system: 'Sistema', home: 'Inicio' },
  pt: { title: 'Configurações', theme: 'Tema', lang: 'Idioma', light: 'Claro', dark: 'Escuro', system: 'Sistema', home: 'Início' },
  ru: { title: 'Настройки', theme: 'Тема', lang: 'Язык', light: 'Светлая', dark: 'Тёмная', system: 'Системная', home: 'Главная' },
  ar: { title: 'الإعدادات', theme: 'المظهر', lang: 'اللغة', light: 'فاتح', dark: 'داكن', system: 'النظام', home: 'الرئيسية' }
};

const settingsText = computed(() => settingsTexts[language.value] || settingsTexts.en);
const settingsTitle = computed(() => settingsText.value.title);
const themeGroupTitle = computed(() => settingsText.value.theme);
const langGroupTitle = computed(() => settingsText.value.lang);
const lightLabel = computed(() => settingsText.value.light);
const darkLabel = computed(() => settingsText.value.dark);
const systemLabel = computed(() => settingsText.value.system);
const navHome = computed(() => settingsText.value.home);

// ===== 滚动返回顶部 =====
const handleScroll = () => {
  showBackTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  systemDarkMedia.addEventListener('change', handleSystemThemeChange);
  applyTheme();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  systemDarkMedia.removeEventListener('change', handleSystemThemeChange);
});
</script>

<style scoped>
:root {
  --header-height: 60px;
}

.app-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  border: none;
}

.home-link {
  position: fixed;
  top: 20px;
  z-index: 1000;
  color: #303133;
  text-decoration: none;
  transition: color 0.3s;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark .home-link {
  color: #e5e7eb;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f0f0f0;
  color: #606266;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: #e0e0e0;
  transform: scale(1.1);
}

.dark .theme-toggle {
  background: #363637;
  color: #e5e7eb;
}

.dark .theme-toggle:hover {
  background: #4a4a4b;
}

.settings-group-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.dark .settings-group-title {
  color: #a8abb2;
}

.settings-radio-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.settings-radio {
  width: 100%;
  height: 40px;
  margin-right: 0;
  border-radius: 8px;
  padding: 0 12px;
  transition: background-color 0.2s;
}

.settings-radio:hover {
  background: #f5f7fa;
}

.dark .settings-radio:hover {
  background: #1f1f1f;
}

.settings-radio :deep(.el-radio__label) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.settings-radio :deep(.el-radio__label .el-icon) {
  font-size: 16px;
}

.router-view {
  width: 100%;
  /* 页面自身的顶部间距与高度由各页面控制（Home 使用固定视口布局） */
}

.back-top-btn {
  position: fixed;
  right: 24px;
  bottom: 60px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.35);
  z-index: 999;
  transition: transform 0.3s, background 0.3s;
}

.back-top-btn:hover {
  background: #337ecc;
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* ===== 页面切换动画 ===== */
.page-fade-slide-enter-active,
.page-fade-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
  will-change: opacity, transform;
}

.page-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}
</style>
