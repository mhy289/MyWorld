<template>
  <el-card class="quote-card">
    <div class="flex items-center justify-center gap-2 mb-4">
      <el-icon :size="20" color="#409eff"><ChatLineSquare /></el-icon>
      <span class="text-lg font-medium">{{ t.quoteTitle }}</span>
      <el-button
        class="ml-1"
        size="small"
        circle
        @click="fetchQuote"
        :loading="loading"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>
    <div v-if="loading" class="flex items-center justify-center gap-2 py-8">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t.quoteLoading }}</span>
    </div>
    <blockquote v-else class="text-center italic text-lg py-4">
      {{ quote.text }}
      <footer class="mt-2 text-sm not-italic text-gray-500 dark:text-gray-400">
        — {{ quote.author }}
      </footer>
    </blockquote>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { ChatLineSquare, Refresh, Loading } from '@element-plus/icons-vue';
import { useI18n } from '../../composables/useI18n';

const translations = {
  en: { quoteTitle: 'Daily Quote', quoteLoading: 'Loading quote...' },
  zh: { quoteTitle: '每日一言', quoteLoading: '正在加载一言...' },
  fr: { quoteTitle: 'Citation du jour', quoteLoading: 'Chargement de la citation...' },
  es: { quoteTitle: 'Cita del día', quoteLoading: 'Cargando cita...' },
  pt: { quoteTitle: 'Citação do dia', quoteLoading: 'Carregando citação...' },
  ru: { quoteTitle: 'Цитата дня', quoteLoading: 'Загрузка цитаты...' },
  ar: { quoteTitle: 'اقتباس اليوم', quoteLoading: 'جاري تحميل الاقتباس...' }
};
const { t } = useI18n(translations);

const quote = ref({ text: '', author: '' });
const loading = ref(false);

const localQuotes = [
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: '道阻且长，行则将至。', author: '《荀子·修身》' },
  { text: 'Everything you can imagine is real.', author: 'Pablo Picasso' },
  { text: '知人者智，自知者明。', author: '老子' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: '不积跬步，无以至千里。', author: '《荀子·劝学》' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' }
];

const fetchQuote = async () => {
  loading.value = true;
  try {
    const res = await fetch('https://v1.hitokoto.cn/?encode=json&c=i&c=k');
    const data = await res.json();
    quote.value = {
      text: data.hitokoto || '...',
      author: data.from || 'Unknown'
    };
  } catch (err) {
    // 本地兜底
    const idx = Math.floor(Math.random() * localQuotes.length);
    quote.value = localQuotes[idx];
  } finally {
    loading.value = false;
  }
};

fetchQuote();
</script>
