import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

let votes = {};

app.post('/api/vote', (req, res) => {
  const { option } = req.body;
  votes[option] = (votes[option] || 0) + 1;
  res.json({ success: true });
});

app.get('/api/votes', (req, res) => {
  res.json(votes);
});

// 用户代理池
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// 随机获取User-Agent
const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// 生成时间戳签名（B站Wbi签名）
const generateWbiSignature = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`;
};

// 请求限流 - 避免触发风控
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 最小请求间隔3秒

const waitBeforeRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest + Math.random() * 2000; // 额外随机等待0-2秒
    console.log(`请求频率限制，等待 ${Math.round(waitTime / 1000)} 秒...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

// B站API代理
app.get('/api/bilibili/user/videos', async (req, res) => {
  try {
    // 限流控制
    await waitBeforeRequest();
    
    const { mid } = req.query;
    const timestamp = Date.now();
    const wts = Math.floor(timestamp / 1000);
    
    console.log(`正在请求B站API, 用户ID: ${mid}, 时间: ${new Date().toLocaleTimeString()}`);
    
    const response = await axios.get('https://api.bilibili.com/x/space/arc/search', {
      params: {
        mid: mid,
        ps: 30,
        pn: 1,
        wts: wts,
        web_location: 1550101
      },
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Referer': `https://space.bilibili.com/${mid}`,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://www.bilibili.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Cookie': '', // 不需要cookie，空cookie更安全
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 25000
    });
    
    console.log(`B站API请求成功, 状态码: ${response.status}, 视频数量: ${response.data.data?.list?.vlist?.length || 0}`);
    res.json(response.data);
  } catch (error) {
    console.error('B站API调用失败:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response) {
      // 服务器响应了，但状态码不在2xx范围内
      res.status(error.response.status).json({ 
        error: 'Bilibili API error',
        status: error.response.status,
        message: error.response.data?.message || '请求失败'
      });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      res.status(503).json({ 
        error: 'No response from Bilibili server',
        message: 'B站服务器无响应，请稍后重试'
      });
    } else {
      // 设置请求时发生了错误
      res.status(500).json({ 
        error: 'Request setup failed',
        message: error.message
      });
    }
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend server is running' 
  });
});

app.listen(8080, () => {
  console.log('=================================');
  console.log('Server running on port 8080');
  console.log('Health check: http://localhost:8080/api/health');
  console.log('Bilibili API: http://localhost:8080/api/bilibili/user/videos?mid=165392864');
  console.log('=================================');
});