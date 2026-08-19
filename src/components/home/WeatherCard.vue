<template>
  <el-card class="weather-card">
    <div class="flex items-center justify-center gap-2 mb-4">
      <el-icon :size="20" color="#409eff"><Sunny /></el-icon>
      <span class="text-lg font-medium">{{ t.weatherTitle }}</span>
      <el-button
        class="ml-1"
        size="small"
        circle
        @click="fetchWeather"
        :loading="loading"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 py-8">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t.weatherLoading }}</span>
    </div>
    <div v-else-if="error" class="text-red-500 dark:text-red-400 text-center py-8">
      {{ t.weatherError }}
    </div>
    <div v-else-if="weather" class="flex flex-col items-center gap-3">
      <div class="flex items-center gap-2">
        <el-icon :size="16"><Location /></el-icon>
        <span class="text-gray-600 dark:text-gray-400">{{ weather.name }}</span>
      </div>
      <div class="text-5xl font-mono text-blue-600 dark:text-blue-400">
        {{ weather.main.temp }}°C
      </div>
      <div class="text-gray-500 dark:text-gray-400">
        {{ weather.weather[0].description }}
      </div>
      <div class="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
        <span>{{ t.humidity }}: {{ weather.main.humidity }}%</span>
        <span>{{ t.windSpeed }}: {{ weather.wind.speed }} m/s</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { Sunny, Refresh, Loading, Location } from '@element-plus/icons-vue';
import { request } from '../../api/request';
import { useI18n } from '../../composables/useI18n';

const translations = {
  en: { weatherTitle: 'Weather', weatherLoading: 'Loading weather...', weatherError: 'Failed to load weather. Please try again.', humidity: 'Humidity', windSpeed: 'Wind' },
  zh: { weatherTitle: '天气', weatherLoading: '正在加载天气...', weatherError: '获取天气失败，请重试。', humidity: '湿度', windSpeed: '风速' },
  fr: { weatherTitle: 'Météo', weatherLoading: 'Chargement de la météo...', weatherError: 'Échec du chargement de la météo. Réessayez.', humidity: 'Humidité', windSpeed: 'Vent' },
  es: { weatherTitle: 'Clima', weatherLoading: 'Cargando clima...', weatherError: 'No se pudo cargar el clima. Inténtalo de nuevo.', humidity: 'Humedad', windSpeed: 'Viento' },
  pt: { weatherTitle: 'Clima', weatherLoading: 'Carregando clima...', weatherError: 'Falha ao carregar clima. Tente novamente.', humidity: 'Umidade', windSpeed: 'Vento' },
  ru: { weatherTitle: 'Погода', weatherLoading: 'Загрузка погоды...', weatherError: 'Не удалось загрузить погоду. Попробуйте снова.', humidity: 'Влажность', windSpeed: 'Ветер' },
  ar: { weatherTitle: 'الطقس', weatherLoading: 'جاري تحميل الطقس...', weatherError: 'فشل تحميل الطقس. حاول مرة أخرى.', humidity: 'الرطوبة', windSpeed: 'الرياح' }
};
const { t } = useI18n(translations);

const weather = ref(null);
const loading = ref(false);
const error = ref(false);

const fetchWeather = async () => {
  loading.value = true;
  error.value = false;
  try {
    const data = await request.get('https://wttr.in/?format=j1', { timeout: 10000 });
    weather.value = {
      name: data.nearest_area[0].areaName[0].value,
      main: { temp: data.current_condition[0].temp_C, humidity: data.current_condition[0].humidity },
      weather: [{ description: data.current_condition[0].lang_zh[0]?.value || data.current_condition[0].weatherDesc[0].value }],
      wind: { speed: data.current_condition[0].windspeedKmph }
    };
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

fetchWeather();
</script>
