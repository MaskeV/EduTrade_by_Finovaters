const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3002;
const API_KEY = 'pub_799213cc11aa895c3f0bd837571ef9af3f3f4';

// Yahoo Finance API Endpoint
app.get('/api/yfinance/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching finance data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// News API Endpoint
app.get('/api/news', async (req, res) => {
  try {
    const url = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=finance&country=in&language=en&category=business`;
    const response = await axios.get(url);
    res.json(response.data.results || []);
  } catch (err) {
    console.error('Error fetching news:', err.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Start the server with both routes
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
