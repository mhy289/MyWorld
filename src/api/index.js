import { apiRequest, API_PATH_PREFIX } from './request';

// 业务 API 统一入口：所有对后端（Go 服务）的调用都在这里定义。
// 部署模式由 .env 的 VITE_API_MODE 控制（same-origin → /api/*，separate → /public/*），
// 两种模式下后端接口功能完全一致（读写均可），仅路径前缀不同。
// 注意：路径统一用 API_PATH_PREFIX 拼接，不要再写死 /api 或 /public。

const P = API_PATH_PREFIX;

// 健康检查
export const getHealth = () => apiRequest.get(`${P}/health`, { timeout: 3000 });

// 投票系统
export const getVotes = () => apiRequest.get(`${P}/votes`);
export const submitVote = (option) => apiRequest.post(`${P}/vote`, { option }, { timeout: 3000 });

// 访客上报：{ ip, domain, time } 三个字段传给后端
export const reportVisitor = (payload) => apiRequest.post(`${P}/visitor/report`, payload, { timeout: 5000 });

// 像素图转换：上传图片，后端缩放为 size×size 像素点图，返回 PNG 二进制
export const convertImage = (file, size) => {
  const form = new FormData();
  form.append('file', file);
  form.append('size', String(size));
  return apiRequest.post(`${P}/pixel/convert`, form, {
    timeout: 15000,
    responseType: 'blob',
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 留言板：获取留言列表（楼层正序）
export const getMessages = () => apiRequest.get(`${P}/messages`);

// 留言板：提交留言（昵称/内容由后端校验，内容限 2000 字）
export const submitMessage = (nickname, content) =>
  apiRequest.post(`${P}/messages`, { nickname, content }, { timeout: 5000 });

// B站用户视频（后端代理，读操作）
export const getUserVideos = (mid) =>
  apiRequest.get(`${P}/bilibili/videos`, { params: { mid } });
