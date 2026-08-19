<template>
  <el-card class="stats-card">
    <template #header>
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="flex items-center gap-2">
          <el-icon :size="18" color="#409eff"><TrendCharts /></el-icon>
          <span class="font-medium">{{ t.statsTitle }}</span>
        </span>
        <el-radio-group v-model="statsRange" size="small" @change="renderChart">
          <el-radio-button :value="7">{{ t.statsLast7Days }}</el-radio-button>
          <el-radio-button :value="14">{{ t.statsLast14Days }}</el-radio-button>
          <el-radio-button :value="30">{{ t.statsLast30Days }}</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div ref="chartRef" class="stats-chart"></div>

    <div class="flex justify-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
      <span class="flex items-center gap-1">
        <el-icon><View /></el-icon>
        {{ t.visitorCount }}: <b class="font-mono">{{ visitorTotal }}</b>
      </span>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { TrendCharts, View } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { useI18n } from '../../composables/useI18n';
import { getVisitorHistory, getVisitorTotal, getDateStr } from '../../composables/useVisitor';

const translations = {
  en: { statsTitle: 'Visit Statistics', statsLast7Days: '7 days', statsLast14Days: '14 days', statsLast30Days: '30 days', visitorCount: 'Total visits' },
  zh: { statsTitle: '访问统计', statsLast7Days: '近 7 天', statsLast14Days: '近 14 天', statsLast30Days: '近 30 天', visitorCount: '累计访问' },
  fr: { statsTitle: 'Statistiques', statsLast7Days: '7 jours', statsLast14Days: '14 jours', statsLast30Days: '30 jours', visitorCount: 'Total visites' },
  es: { statsTitle: 'Estadísticas', statsLast7Days: '7 días', statsLast14Days: '14 días', statsLast30Days: '30 días', visitorCount: 'Visitas totales' },
  pt: { statsTitle: 'Estatísticas', statsLast7Days: '7 dias', statsLast14Days: '14 dias', statsLast30Days: '30 dias', visitorCount: 'Total de visitas' },
  ru: { statsTitle: 'Статистика', statsLast7Days: '7 дней', statsLast14Days: '14 дней', statsLast30Days: '30 дней', visitorCount: 'Всего посещений' },
  ar: { statsTitle: 'الإحصائيات', statsLast7Days: '7 أيام', statsLast14Days: '14 يومًا', statsLast30Days: '30 يومًا', visitorCount: 'إجمالي الزيارات' }
};
const { t } = useI18n(translations);

const chartRef = ref(null);
const statsRange = ref(7);
const history = ref(getVisitorHistory());
const visitorTotal = computed(() => getVisitorTotal());

let chart = null;
let themeObserver = null;

const getRecentDays = (days) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(getDateStr(d));
  }
  return dates;
};

const renderChart = () => {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }
  const days = getRecentDays(statsRange.value);
  const data = days.map((d) => history.value[d] || 0);
  const isDark = document.documentElement.classList.contains('dark');

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1f1f1f' : '#fff',
      borderColor: isDark ? '#363637' : '#e4e7ed',
      textStyle: { color: isDark ? '#e5e7eb' : '#303133' }
    },
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      data: days.map((d) => d.slice(5)),
      axisLine: { lineStyle: { color: isDark ? '#4a4a4b' : '#dcdfe6' } },
      axisLabel: { color: isDark ? '#a8abb2' : '#606266' }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: isDark ? '#2c2c2d' : '#f0f2f5' } },
      axisLabel: { color: isDark ? '#a8abb2' : '#606266' }
    },
    series: [
      {
        name: t.value.visitorCount,
        type: 'line',
        smooth: true,
        data,
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' }
          ])
        }
      }
    ]
  });
};

const handleThemeChange = () => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  renderChart();
};

const handleResize = () => {
  chart && chart.resize();
};

onMounted(() => {
  renderChart();
  themeObserver = new MutationObserver(handleThemeChange);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  themeObserver && themeObserver.disconnect();
  window.removeEventListener('resize', handleResize);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style scoped>
.stats-chart {
  width: 100%;
  height: 300px;
}
</style>
