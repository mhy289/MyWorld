<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-text">页面未找到</p>
      <p class="error-desc">Page not found</p>
      <router-link to="/" class="back-btn">
        <el-icon><HomeFilled /></el-icon>
        <span>返回首页</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue';
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  text-align: center;
}

.not-found-content {
  animation: fadeIn 0.6s ease;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(64, 158, 255, 0.2);
}

.error-text {
  font-size: 24px;
  color: #303133;
  margin: 16px 0 8px;
}

.dark .error-text {
  color: #e5e7eb;
}

.error-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 32px;
}

.dark .error-desc {
  color: #6b7280;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #409eff;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #337ecc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
