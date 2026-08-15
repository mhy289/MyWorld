# MyWorld

个人展示网站，基于 Vue 3 + Vite 构建，前后端分离架构。

## 功能

- **IP 展示**：自动获取并展示访客公网 IP
- **多语言支持**：7 种语言（英/中/法/西/葡/俄/阿），根据 IP 地区自动切换
- **B站视频嵌入**：随机展示 B站 用户视频，支持内嵌播放（后端代理，绕过跨域与风控）
- **投票系统**：1-10 数字投票，ECharts 实时统计图表
- **暗色模式**：亮色/暗色主题切换

## 技术栈

- 前端：Vue 3 (Composition API) + Vite + Vue Router (Hash) + Element Plus + ECharts + Axios
- 后端：Go（标准库 `net/http`，无第三方依赖）

## 架构（前后端分离）

```
浏览器 ── axios ──> /api/* ──> Go 后端 (backend/main.go, 端口 8080)
  │                    │
  └── 开发环境: Vite dev server 通过 proxy 转发 /api 到本地 Go 后端
  └── 生产环境: 可同源（Go 托管静态文件）或跨域（后端已内置 CORS）
```

前端所有后端请求统一封装在 `src/api/`：

- `src/api/request.js` — axios 实例（baseURL 默认 `/api`，可用 `VITE_API_BASE_URL` 环境变量覆盖）+ 拦截器
- `src/api/index.js` — 业务 API（健康检查 / 投票 / B站代理）

## 快速开始

```bash
# 1. 安装前端依赖
npm install

# 2. 启动 Go 后端（端口 8080）
cd backend
go run main.go

# 3. 启动前端开发服务器（/api 自动代理到 localhost:8080）
npm run dev

# 构建生产版本
npm run build
```

## 后端接口

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | `/api/health` | 健康检查 |
| POST | `/api/vote` | 投票 `{ "option": <任意值> }`（内存存储） |
| GET | `/api/votes` | 获取投票数据 |
| GET | `/api/bilibili/user/videos?mid=xxx` | B站用户视频代理（UA 池 / 限流 / Wbi 参数） |

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
backend/
└── main.go           # Go 后端（原 server.js 的替代，仅标准库）
```

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）在推送 `master` 或手动触发时：

1. 构建前端 `dist/` 并通过 SSH 部署到服务器
2. 交叉编译 Go 后端（linux/amd64）并部署、重启

需要配置 secrets：

- `SSH_PRIVATE_KEY` / `SSH_HOST` / `SSH_USERNAME`
- `DEPLOY_DIR`：前端静态文件目录（如 `/var/www/myworld`）
- `BACKEND_DIR`：后端二进制目录（如 `/opt/myworld/backend`）

## 许可

MIT
