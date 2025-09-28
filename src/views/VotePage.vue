<template>
  <div class="vote-container">
    <h2>投票系统</h2>
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
import axios from 'axios';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      voteCounts: {},
      chart: null
    };
  },
  mounted() {
    this.initChart();
    this.options.forEach(option => {
      this.voteCounts[option] = 0;
    });
    this.fetchVotes();
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer);
      this.updateChart();
    },
    updateChart() {
      const option = {
        tooltip: {},
        xAxis: {
          type: 'category',
          data: this.options,
          axisLabel: {
            color: '#333'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#333'
          }
        },
        series: [{
          data: this.options.map(option => this.voteCounts[option]),
          type: 'bar',
          itemStyle: {
            color: '#409EFF'
          },
          barWidth: '40%'
        }]
      };
      this.chart.setOption(option);
    },
    async vote(option) {
      try {
        console.log('发送投票请求:', { option });
        const response = await axios.post('/vote', { option });
        console.log('投票响应:', response.data);
        this.voteCounts[option]++;
        this.updateChart();
        ElMessage.success('投票成功！');
        //刷新页面
        window.location.reload();
      } catch (error) {
        console.error('投票失败:', error.response?.data || error.message);
        ElMessage.error('投票失败，请重试！');
      }
    },
    async fetchVotes() {
      try {
        console.log('获取投票数据...');
        const response = await axios.get('/votes');
        this.voteCounts = response.data;
      } catch (error) {
        console.error('获取投票数据失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.vote-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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
</style>