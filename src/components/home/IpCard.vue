<template>
  <el-card class="ip-card">
    <div class="flex justify-end mb-4">
      <el-button @click="getIP" :loading="loading" size="small">
        {{ t.getIP }}
      </el-button>
    </div>
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 font-mono text-xl py-4">
      {{ t.loadingIP }}
    </div>
    <div v-else-if="error" class="text-center text-red-500 dark:text-red-400 font-mono text-xl py-4">
      {{ t.errorIP }}
    </div>
    <div v-else class="text-center py-4">
      <p class="text-gray-600 dark:text-gray-400 font-mono">{{ t.yourIP }}</p>
      <div class="flex items-center justify-center gap-3 mt-3">
        <span class="text-blue-600 dark:text-blue-400 font-mono text-2xl">{{ ip }}</span>
        <el-button size="small" circle @click="copyIP" :type="copied ? 'success' : 'default'">
          <el-icon>
            <Check v-if="copied" />
            <CopyDocument v-else />
          </el-icon>
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Check, CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { request } from '../../api/request';
import { useI18n, setLanguage } from '../../composables/useI18n';

const translations = {
  en: { getIP: 'Get IP', yourIP: 'Your IP Address:', loadingIP: 'Loading IP address...', errorIP: 'Failed to fetch IP. Please try again.', copied: 'IP copied!' },
  zh: { getIP: '获取 IP', yourIP: '你的 IP 地址：', loadingIP: '正在加载 IP 地址...', errorIP: '获取 IP 失败，请重试。', copied: 'IP 已复制！' },
  fr: { getIP: 'Obtenir IP', yourIP: 'Votre adresse IP :', loadingIP: 'Chargement de l\'adresse IP...', errorIP: 'Échec de la récupération IP. Réessayez.', copied: 'IP copiée !' },
  es: { getIP: 'Obtener IP', yourIP: 'Tu dirección IP:', loadingIP: 'Cargando dirección IP...', errorIP: 'No se pudo obtener la IP. Inténtalo de nuevo.', copied: '¡IP copiada!' },
  pt: { getIP: 'Obter IP', yourIP: 'Seu endereço IP:', loadingIP: 'Carregando endereço IP...', errorIP: 'Falha ao obter IP. Tente novamente.', copied: 'IP copiado!' },
  ru: { getIP: 'Получить IP', yourIP: 'Ваш IP-адрес:', loadingIP: 'Загрузка IP-адреса...', errorIP: 'Не удалось получить IP. Попробуйте снова.', copied: 'IP скопирован!' },
  ar: { getIP: 'الحصول على IP', yourIP: 'عنوان IP الخاص بك:', loadingIP: 'جاري تحميل عنوان IP...', errorIP: 'فشل الحصول على IP. حاول مرة أخرى.', copied: 'تم نسخ IP!' }
};
const { t } = useI18n(translations);

const ip = ref('');
const loading = ref(false);
const error = ref(false);
const copied = ref(false);

const isLanguageManual = localStorage.getItem('app_language_manual') === '1';

// 根据 IP 归属地自动切换界面语言（仅当用户未手动设置过语言时生效）
const detectLanguageByIP = (ipAddress) => {
  if (!ipAddress) return null;
  const parts = ipAddress.split('.');
  const first = parseInt(parts[0], 10);
  const second = parseInt(parts[1], 10);
  // 中国大陆 IP 段
  if (first === 39 || first === 49 || first === 101 || first === 106 || first === 110 || first === 111 ||
      first === 112 || first === 113 || first === 114 || first === 115 || first === 116 || first === 117 ||
      first === 118 || first === 119 || first === 120 || first === 121 || first === 122 || first === 123 ||
      first === 124 || first === 125 || first === 139 || first === 144 || first === 150 || first === 153 ||
      first === 157 || first === 158 || first === 159 || first === 160 || first === 163 || first === 164 ||
      first === 171 || first === 175 || first === 180 || first === 182 || first === 183 || first === 202 ||
      first === 203 || first === 210 || first === 211 || first === 218 || first === 219 || first === 220 ||
      first === 221 || first === 222 || first === 223) {
    return 'zh';
  }
  // 中国大陆 IPv6 段
  if (ipAddress.includes(':')) {
    const prefix = ipAddress.toLowerCase().slice(0, 6);
    if (['2400:', '2401:', '2402:', '2403:', '2404:', '2405:', '2406:', '2407:', '2408:', '2409:', '240a:', '240b:', '240c:', '240d:', '240e:', '240f:'].includes(prefix)) {
      return 'zh';
    }
  }
  return null;
};

// 获取 IP，成功后按地区自动设置语言，并上报访客（ip / domain / time）
const getIP = async () => {
  loading.value = true;
  error.value = false;
  copied.value = false;
  try {
    const data = await request.get('https://api.ipify.org?format=json', { timeout: 5000 });
    ip.value = data.ip;
    if (!isLanguageManual) {
      const detected = detectLanguageByIP(data.ip);
      if (detected && detected !== localStorage.getItem('app_language')) {
        setLanguage(detected);
      }
    }
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const copyIP = async () => {
  if (!ip.value) return;
  try {
    await navigator.clipboard.writeText(ip.value);
    copied.value = true;
    ElMessage.success(t.value.copied);
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    ElMessage.error(t.value.errorIP);
  }
};

onMounted(getIP);
</script>
