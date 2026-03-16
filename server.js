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

// B站API代理
app.get('/api/bilibili/user/videos', async (req, res) => {
  try {
    const { mid } = req.query;
    console.log(`正在请求B站API, 用户ID: ${mid}, 时间: ${new Date().toLocaleTimeString()}`);
    
    const response = await axios.get('https://api.bilibili.com/x/space/arc/search', {
      params: {
        mid: mid,
        ps: 30,
        pn: 1
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': `https://space.bilibili.com/${mid}`,
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://www.bilibili.com'
      },
      timeout: 15000
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

app.listen(8080, () => {
  console.log('Server running on port 8080');
});