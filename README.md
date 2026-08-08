# MyWorld

个人展示网站，基于 Vue 3 + Vite 构建。

## 功能

- **IP 展示**：自动获取并展示访客公网 IP
- **多语言支持**：7 种语言（英/中/法/西/葡/俄/阿），根据 IP 地区自动切换
- **B站视频嵌入**：随机展示 B站 用户视频，支持内嵌播放
- **投票系统**：1-10 数字投票，ECharts 实时统计图表
- **暗色模式**：亮色/暗色主题切换

## 技术栈

- Vue 3 (Composition API)
- Vite
- Vue Router (Hash 模式)
- Element Plus
- ECharts
- Axios
- Express.js (后端)

## 快速开始

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 启动后端服务器（端口 8080）
node server.js

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── main.js           # 应用入口
├── App.vue           # 根组件
├── router/index.js   # 路由配置
├── assets/styles.css # 全局样式
└── views/
    ├── Home.vue      # 首页
    └── VotePage.vue  # 投票页面
```

## 许可

MIT
