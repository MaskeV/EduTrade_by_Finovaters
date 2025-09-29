// backend/news.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 5000;
const API_KEY = 'pub_799213cc11aa895c3f0bd837571ef9af3f3f4';

app.get('/api/news', async (req, res) => {
  try {
    const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=finance&country=in&language=en&category=business`;
    const response = await axios.get(url);
    res.json(response.data.results || []);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`📰 News server running at http://localhost:${PORT}`);
});
