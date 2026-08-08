<template>
  <div class="app-container">
    <router-link to="/" class="home-link">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </router-link>
    <router-link to="/vote" class="vote-link">
      投票页面
    </router-link>
    <div class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换亮色模式' : '切换暗色模式'">
      <el-icon :size="18">
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </div>
    <router-view class="router-view" />
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
import { ref, onMounted, onUnmounted } from 'vue';
import { HomeFilled, Top, Sunny, Moon } from '@element-plus/icons-vue';

const showBackTop = ref(false);
const isDark = ref(false);

const handleScroll = () => {
  showBackTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  isDark.value = document.documentElement.classList.contains('dark');
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
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

.home-link,
.vote-link {
  position: fixed;
  top: 20px;
  z-index: 1000;
  color: #303133;
  text-decoration: none;
  transition: color 0.3s;
}

.dark .home-link,
.dark .vote-link {
  color: #e5e7eb;
}

.home-link {
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-link {
  right: 20px;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 110px;
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

.router-view {
  width: 100%;
  height: calc(100vh - var(--header-height));
  margin-top: calc(var(--header-height) + 20px);
  margin-top: var(--header-height);
  margin-top: var(--header-height);
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
</style>
