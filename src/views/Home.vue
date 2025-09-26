<template>
  <div class="home-container">
    <el-card>
      <div v-if="loading" class="text-gray-500 font-mono text-xl">
        {{ t.loadingIP }}
      </div>
      <div v-else-if="error" class="text-red-500 font-mono text-xl">
        {{ t.errorIP }}
      </div>
      <span v-else class="text-blue-600 font-mono text-xl">{{ ip }}</span>
    </el-card>

    <!-- 装饰元素 -->
    <div class="flex justify-center mt-10">
      <el-icon :size="60" color="#3b82f6" :opacity="0.8">
        <component :is="Cloud" />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import * as Icons from '@element-plus/icons-vue';
const { Cloud } = Icons;
import { ElIcon } from 'element-plus';

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
    errorIP: "Failed to fetch IP. Please try again."
  },
  zh: {
    title: "你好，Cloudflare Pages",
    heading: "你好，世界！",
    description: "🚀 这是一个部署在 Cloudflare Pages 上的静态页面。",
    language: "语言",
    getIP: "获取 IP",
    yourIP: "你的 IP 地址：",
    loadingIP: "正在加载 IP 地址...",
    errorIP: "获取 IP 失败，请重试。"
  }
};

const language = ref('en');
const ip = ref('');
const loading = ref(false);
const error = ref(false);

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
});

const t = computed(() => translations[language.value]);
</script>

<style scoped>
.home-container {
  padding: 20px;
}
</style>