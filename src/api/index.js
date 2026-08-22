import { request, publicRequest, withFallback, LOCAL_API_ENABLED } from './request';

// 业务 API 统一入口：所有对后端（Go 服务）的调用都在这里定义
// 注：request 的 baseURL 已带 /api 前缀；publicRequest 路径带 /public 前缀
//
// 回退策略：本地接口（/api/*）连不上时自动回退到对外公开接口（/public/*）
// - 投票为写操作，对外接口为只读，无回退版本，连不上时保持原有错误提示

// 健康检查
export const getHealth = () =>
  withFallback(
    () => request.get('/health', { timeout: 3000 }),
    () => publicRequest.get('/public/health', { timeout: 3000 })
  );

// 投票系统
export const getVotes = () =>
  withFallback(
    () => request.get('/votes'),
    // 对外统计返回 { data: votes }，归一化为 votes 本体
    () => publicRequest.get('/public/stats/votes').then((res) => res?.data ?? res)
  );

// 写操作：仅本地接口提供，对外为只读，不回退
export const submitVote = (option) => {
  // 本地接口开关关闭时，投票写操作无可用接口，直接提示
  if (!LOCAL_API_ENABLED) {
    return Promise.reject(new Error('本地接口已关闭，无法投票'));
  }
  return request.post('/vote', { option }, { timeout: 3000 });
};

// 访客上报：{ ip, domain, time } 三个字段传给后端（写操作，仅本地接口提供）
export const reportVisitor = (payload) => {
  // 本地接口开关关闭时，访客上报无可用接口，直接提示
  if (!LOCAL_API_ENABLED) {
    return Promise.reject(new Error('本地接口已关闭，无法上报访客'));
  }
  return request.post('/visitor/report', payload, { timeout: 5000 });
};

// 像素图转换：上传图片，后端缩放为 size×size 像素点图，返回 PNG 二进制（写操作，仅本地接口）
export const convertImage = (file, size) => {
  if (!LOCAL_API_ENABLED) {
    return Promise.reject(new Error('本地接口已关闭，无法转换图片'));
  }
  const form = new FormData();
  form.append('file', file);
  form.append('size', String(size));
  return request.post('/pixel/convert', form, {
    timeout: 15000,
    responseType: 'blob',
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 留言板：获取留言列表（楼层正序）
export const getMessages = () =>
  withFallback(
    () => request.get('/messages'),
    // 对外只读接口返回 { data: messages }，归一化为 messages 本体
    () => publicRequest.get('/public/messages').then((res) => res?.data ?? res)
  );

// 留言板：提交留言（写操作，仅本地接口提供，不回退）
export const submitMessage = (nickname, content) => {
  if (!LOCAL_API_ENABLED) {
    return Promise.reject(new Error('本地接口已关闭，无法留言'));
  }
  return request.post('/messages', { nickname, content }, { timeout: 5000 });
};

// B站用户视频（后端代理，对外接口与本地返回格式一致）
export const getUserVideos = (mid) =>
  withFallback(
    () => request.get('/bilibili/user/videos', { params: { mid } }),
    () => publicRequest.get('/public/bilibili/videos', { params: { mid } })
  );
