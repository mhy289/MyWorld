<template>
  <div class="app-container">
    <router-link to="/" class="home-link">
      首页
    </router-link>
    <router-link to="/vote" class="vote-link">
      投票页面
    </router-link>
    <router-view class="router-view" />
  </div>
</template>

<script setup>
// 无需其他逻辑，仅作为容器
</script>

<style scoped>
.app-container {
  position: relative;
  height: 100vh;
  width: 100vw;
}

.home-link,
.vote-link {
  position: fixed;
  top: 20px;
  z-index: 1000;
}

.home-link {
  left: 20px;
}

.vote-link {
  right: 20px;
}

.router-view {
  width: 100%;
  height: 100vh;
}
</style>
