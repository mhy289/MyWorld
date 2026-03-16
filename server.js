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
    const response = await axios.get('https://api.bilibili.com/x/space/arc/search', {
      params: {
        mid: mid,
        ps: 30,
        pn: 1
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('B站API调用失败:', error.message);
    res.status(500).json({ error: 'Failed to fetch Bilibili data' });
  }
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});