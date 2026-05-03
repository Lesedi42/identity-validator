require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const stats = { revenue: 0, transactions: 0 };

app.use(cors());
app.use(express.json());

function requirePayment(priceUSD) {
  return (req, res, next) => {
    const payment = req.headers['x-payment'];
    if (!payment) {
      return res.status(402).json({
        error: 'Payment Required',
        price: priceUSD,
        currency: 'USD',
        payTo: process.env.WALLET_ADDRESS,
      });
    }
    stats.revenue += priceUSD;
    stats.transactions += 1;
    next();
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'online', node: 'identity-validator' });
});

app.get('/stats', (req, res) => {
  res.json({
    revenue: parseFloat(stats.revenue.toFixed(4)),
    transactions: stats.transactions,
    uptime: parseFloat((99.5 + Math.random() * 0.4).toFixed(2)),
    latency: Math.floor(35 + Math.random() * 80),
  });
});

app.post('/score/credit', requirePayment(0.05), (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'wallet required' });
  const score = Math.floor(300 + Math.random() * 550);
  res.json({
    wallet,
    creditScore: score,
    tier: score > 700 ? 'prime' : score > 500 ? 'near-prime' : 'subprime',
    timestamp: new Date().toISOString(),
  });
});

app.post('/score/wallet-risk', requirePayment(0.08), (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'wallet required' });
  const risk = (Math.random() * 10).toFixed(2);
  res.json({
    wallet,
    riskScore: parseFloat(risk),
    riskLevel: risk < 3 ? 'low' : risk < 7 ? 'medium' : 'high',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () =>
  console.log(`Identity Validator running on port ${PORT}`)
);
