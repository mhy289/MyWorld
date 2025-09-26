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
    <div class="chart-container">
      <div 
        v-for="(count, option) in voteCounts" 
        :key="option" 
        class="bar"
        :style="{ height: count * 10 + 'px' }"
      >
        {{ count }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      voteCounts: {}
    };
  },
  created() {
    this.options.forEach(option => {
      this.voteCounts[option] = 0;
    });
    this.fetchVotes();
  },
  methods: {
    async vote(option) {
      try {
        await axios.post('/api/vote', { option });
        this.voteCounts[option]++;
      } catch (error) {
        console.error('投票失败:', error);
      }
    },
    async fetchVotes() {
      try {
        const response = await axios.get('/api/votes');
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
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 300px;
  padding: 20px 0;
}
.bar {
  flex: 1;
  background-color: #67c23a;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 5px;
  color: white;
  min-width: 30px;
  transition: height 0.3s;
}
</style>