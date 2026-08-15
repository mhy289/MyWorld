<template>
  <div class="vote-container">
    <h2>投票系统</h2>
    <div class="mode-indicator">
      <span v-if="backendAvailable" class="mode-tag online">
        <i class="el-icon-check"></i> 在线模式
      </span>
      <span v-else class="mode-tag offline">
        <i class="el-icon-warning"></i> 离线模式（数据仅保存在本地）
      </span>
    </div>
    <div class="options">
      <button 
        v-for="option in options" 
        :key="option" 
        @click="vote(option)"
      >
        {{ option }}
      </button>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { getVotes, submitVote } from '../api';

const STORAGE_KEY = 'local_votes';

export default {
  data() {
    return {
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      voteCounts: {},
      chart: null,
      isDark: false,
      backendAvailable: false
    };
  },
  async mounted() {
    this.isDark = document.documentElement.classList.contains('dark');
    this.options.forEach(option => {
      this.voteCounts[option] = 0;
    });

    // 优先尝试连接后端
    await this.checkBackend();

    if (this.backendAvailable) {
      await this.fetchVotesFromBackend();
      console.log('已连接后端，使用在线模式');
    } else {
      this.loadLocalVotes();
      console.log('后端不可用，使用离线模式');
    }

    this.initChart();
    this.observeTheme();
  },
  methods: {
    async checkBackend() {
      try {
        await getVotes();
        this.backendAvailable = true;
      } catch {
        this.backendAvailable = false;
      }
    },
    async fetchVotesFromBackend() {
      try {
        const data = await getVotes();
        Object.keys(data).forEach(key => {
          const numKey = Number(key);
          if (this.options.includes(numKey)) {
            this.voteCounts[numKey] = data[key];
          }
        });
      } catch (e) {
        console.warn('从后端获取投票数据失败，切换为离线模式:', e);
        this.backendAvailable = false;
        this.loadLocalVotes();
      }
    },
    loadLocalVotes() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach(key => {
            const numKey = Number(key);
            if (this.options.includes(numKey)) {
              this.voteCounts[numKey] = parsed[key];
            }
          });
        }
      } catch (e) {
        console.warn('读取本地投票数据失败:', e);
      }
    },
    saveLocalVotes() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.voteCounts));
      } catch (e) {
        console.warn('保存投票数据失败:', e);
      }
    },
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer, this.isDark ? 'dark' : undefined);
      this.updateChart();
    },
    updateChart() {
      const textColor = this.isDark ? '#e5e7eb' : '#333';
      const option = {
        tooltip: {},
        xAxis: {
          type: 'category',
          data: this.options,
          axisLabel: { color: textColor }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textColor }
        },
        series: [{
          data: this.options.map(option => this.voteCounts[option]),
          type: 'bar',
          itemStyle: { color: '#409EFF' },
          barWidth: '40%'
        }]
      };
      this.chart.setOption(option);
    },
    observeTheme() {
      const observer = new MutationObserver(() => {
        const newDark = document.documentElement.classList.contains('dark');
        if (newDark !== this.isDark) {
          this.isDark = newDark;
          if (this.chart) {
            this.chart.dispose();
            this.initChart();
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    },
    async vote(option) {
      if (this.backendAvailable) {
        try {
          await submitVote(option);
          this.voteCounts[option]++;
          this.updateChart();
          ElMessage.success(`已为选项 ${option} 投票（在线），当前票数：${this.voteCounts[option]}`);
          return;
        } catch (e) {
          console.warn('后端投票失败，自动切换为离线模式:', e);
          ElMessage.warning('后端投票失败，已切换为离线模式');
          this.backendAvailable = false;
        }
      }

      // 离线模式
      this.voteCounts[option]++;
      this.updateChart();
      this.saveLocalVotes();
      ElMessage.success(`已为选项 ${option} 投票（离线），当前票数：${this.voteCounts[option]}`);
    }
  }
};
</script>

<style scoped>
.vote-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #303133;
  transition: color 0.3s;
}

.dark .vote-container,
.vote-container.dark {
  color: #e5e7eb;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.options button {
  padding: 10px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dark .chart-container {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.4);
}

.mode-indicator {
  text-align: center;
  margin-bottom: 16px;
}

.mode-tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
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