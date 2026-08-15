# MyWorld

个人展示网站，基于 Vue 3 + Vite 构建。本仓库仅为前端，后端已分离至独立仓库。

## 功能

- **IP 展示**：自动获取并展示访客公网 IP
- **多语言支持**：7 种语言（英/中/法/西/葡/俄/阿），根据 IP 地区自动切换
- **B站视频嵌入**：随机展示 B站 用户视频，支持内嵌播放（经后端代理）
- **投票系统**：1-10 数字投票，ECharts 实时统计图表
- **暗色模式**：亮色/暗色主题切换

## 技术栈

- Vue 3 (Composition API) + Vite + Vue Router (Hash) + Element Plus + ECharts + Axios

## 架构

```
浏览器 ── axios ──> /api/* ──> 后端服务（独立仓库，Go，端口 8080）
  │
  └── 开发环境: Vite dev server 通过 proxy 转发 /api 到本地后端
  └── 生产环境: 同源部署或跨域（后端已内置 CORS）
```

前端所有后端请求统一封装在 `src/api/`：

- `src/api/request.js` — axios 实例 + 拦截器 + 回退策略
- `src/api/index.js` — 业务 API（健康检查 / 投票 / B站代理）

## 接口回退策略

本地接口（`/api/*`）连不上时，自动回退到后端对外公开接口（`/public/*`，只读）：

- 仅当**网络连不上**（超时 / 无响应）时触发回退；后端返回业务错误（4xx/5xx）表示服务在线，不回退
- 投票为写操作，对外接口只读，无回退版本
- 对外接口默认同源（`/public/*`），异地部署时用 `VITE_PUBLIC_API_BASE_URL` 指定完整地址（如 `https://api.example.com`）

| 环境变量 | 说明 | 默认 |
| ---- | ---- | ---- |
| `VITE_API_BASE_URL` | 本地接口 base URL | `/api` |
| `VITE_PUBLIC_API_BASE_URL` | 对外接口 base URL（含域名） | 空（同源） |

## 后端接口约定

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | `/api/health` | 健康检查 |
| POST | `/api/vote` | 投票 `{ "option": <任意值> }` |
| GET | `/api/votes` | 获取投票数据 |
| GET | `/api/bilibili/user/videos?mid=xxx` | B站用户视频代理 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动前端开发服务器（/api 自动代理到本地后端，默认 localhost:8080，可用 BACKEND_URL 覆盖）
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── api/               # 统一 API 层（axios 封装）
│   ├── request.js
│   └── index.js
├── main.js           # 应用入口
├── App.vue           # 根组件
├── router/index.js   # 路由配置
├── assets/styles.css # 全局样式
└── views/
    ├── Home.vue      # 首页
    └── VotePage.vue  # 投票页面
```

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）在推送 `master` 或手动触发时构建前端 `dist/` 并通过 SSH 部署到服务器。

需要配置 secrets：

- `SSH_PRIVATE_KEY` / `SSH_HOST` / `SSH_USERNAME`
- `DEPLOY_DIR`：前端静态文件目录（如 `/var/www/myworld`）

## 许可

MIT
