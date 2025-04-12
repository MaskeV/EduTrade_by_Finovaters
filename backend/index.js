// server.js (in your project root)
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Yahoo Finance endpoint
app.get('/api/yfinance/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => console.log('Server running on port 3002'));