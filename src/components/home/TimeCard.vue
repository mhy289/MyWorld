<template>
  <el-card class="time-card">
    <div class="flex items-center justify-center gap-2 text-2xl font-mono text-gray-700 dark:text-gray-300 py-6">
      <el-icon :size="22" color="#409eff"><Clock /></el-icon>
      <span>{{ currentTime }}</span>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Clock } from '@element-plus/icons-vue';

const currentTime = ref('');
let timer = null;

const updateTime = () => {
  currentTime.value = new Date().toLocaleString();
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
