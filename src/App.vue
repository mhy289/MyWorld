<template>
  <div class="app-container">
    <router-link to="/" class="home-link">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </router-link>
    <router-link to="/vote" class="vote-link">
      投票页面
    </router-link>
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
import { HomeFilled, Top } from '@element-plus/icons-vue';

const showBackTop = ref(false);

const handleScroll = () => {
  showBackTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
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
