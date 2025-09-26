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
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue';
</script>

<style scoped>
.app-container {
  position: relative;
  height: 100vh;
  width: 100vw;
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
  height: calc(100vh - 60px);
  margin-top: 60px;
}
</style>
