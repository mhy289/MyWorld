<template>
  <el-card class="vote-card">
    <template #header>
      <div class="flex items-center gap-2">
        <el-icon :size="18" color="#409eff"><DataAnalysis /></el-icon>
        <span class="font-medium">投票系统</span>
        <span v-if="backendAvailable" class="mode-tag online">在线模式</span>
        <span v-else class="mode-tag offline">离线模式（数据仅保存在本地）</span>
      </div>
    </template>

    <div class="options">
      <el-button
        v-for="option in options"
        :key="option"
        @click="vote(option)"
        :type="backendAvailable ? 'primary' : 'default'"
      >
        {{ option }}
      </el-button>
    </div>

    <div class="chart-container" ref="chartContainer"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { DataAnalysis } from '@element-plus/icons-vue';
import { getVotes, submitVote } from '../../api';

const STORAGE_KEY = 'local_votes';

const options = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const voteCounts = ref({});
const backendAvailable = ref(false);
const chartContainer = ref(null);
const isDark = ref(false);

let chart = null;
let themeObserver = null;

const initCounts = () => {
  options.value.forEach((option) => {
    if (voteCounts.value[option] === undefined) {
      voteCounts.value[option] = 0;
    }
  });
};

const loadLocalVotes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((key) => {
        const numKey = Number(key);
        if (options.value.includes(numKey)) {
          voteCounts.value[numKey] = parsed[key];
        }
      });
    }
  } catch (e) {
    console.warn('读取本地投票数据失败:', e);
  }
};

const saveLocalVotes = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voteCounts.value));
  } catch (e) {
    console.warn('保存投票数据失败:', e);
  }
};

const checkBackend = async () => {
  try {
    await getVotes();
    backendAvailable.value = true;
  } catch {
    backendAvailable.value = false;
  }
};

const fetchVotesFromBackend = async () => {
  try {
    const data = await getVotes();
    Object.keys(data).forEach((key) => {
      const numKey = Number(key);
      if (options.value.includes(numKey)) {
        voteCounts.value[numKey] = data[key];
      }
    });
  } catch (e) {
    console.warn('从后端获取投票数据失败，切换为离线模式:', e);
    backendAvailable.value = false;
    loadLocalVotes();
  }
};

const initChart = () => {
  chart = echarts.init(chartContainer.value, isDark.value ? 'dark' : undefined);
  updateChart();
};

const updateChart = () => {
  const textColor = isDark.value ? '#e5e7eb' : '#333';
  chart.setOption({
    tooltip: {},
    xAxis: {
      type: 'category',
      data: options.value,
      axisLabel: { color: textColor }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor }
    },
    series: [
      {
        data: options.value.map((option) => voteCounts.value[option]),
        type: 'bar',
        itemStyle: { color: '#409EFF' },
        barWidth: '40%'
      }
    ]
  });
};

const handleThemeChange = () => {
  const newDark = document.documentElement.classList.contains('dark');
  if (newDark !== isDark.value) {
    isDark.value = newDark;
    if (chart) {
      chart.dispose();
      initChart();
    }
  }
};

const handleResize = () => {
  chart && chart.resize();
};

const vote = async (option) => {
  if (backendAvailable.value) {
    try {
      await submitVote(option);
      voteCounts.value[option]++;
      updateChart();
      ElMessage.success(`已为选项 ${option} 投票（在线），当前票数：${voteCounts.value[option]}`);
      return;
    } catch (e) {
      console.warn('后端投票失败，自动切换为离线模式:', e);
      ElMessage.warning('后端投票失败，已切换为离线模式');
      backendAvailable.value = false;
    }
  }
  // 离线模式
  voteCounts.value[option]++;
  updateChart();
  saveLocalVotes();
  ElMessage.success(`已为选项 ${option} 投票（离线），当前票数：${voteCounts.value[option]}`);
};

onMounted(async () => {
  initCounts();
  isDark.value = document.documentElement.classList.contains('dark');

  await checkBackend();
  if (backendAvailable.value) {
    await fetchVotesFromBackend();
  } else {
    loadLocalVotes();
  }

  initChart();
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
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 360px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dark .chart-container {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
}

.mode-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  margin-left: 8px;
  transition: all 0.3s;
}

.mode-tag.online {
  background: #e6f7e6;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}

.dark .mode-tag.online {
  background: rgba(56, 158, 13, 0.15);
  color: #73d13d;
  border-color: rgba(56, 158, 13, 0.3);
}

.mode-tag.offline {
  background: #fff7e6;
  color: #d48806;
  border: 1px solid #ffd591;
}

.dark .mode-tag.offline {
  background: rgba(212, 136, 6, 0.15);
  color: #ffc53d;
  border-color: rgba(212, 136, 6, 0.3);
}
</style>
