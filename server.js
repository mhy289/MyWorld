const express = require('express');
const cors = require('cors');
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});