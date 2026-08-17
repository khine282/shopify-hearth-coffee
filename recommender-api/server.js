const express = require('express');
const cors = require('cors');
const { validateAnswers, getMatches } = require('./recommend');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'hearth-recommender-api', status: 'ok', endpoints: ['POST /recommend', 'GET /health'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/recommend', (req, res) => {
  const answers = req.body;
  if (!validateAnswers(answers)) {
    return res.status(400).json({
      error: 'Invalid answers. Expected { flavor, strength, caffeine } with valid enum values.'
    });
  }
  const matches = getMatches(answers, 3);
  res.json({ matches });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`hearth-recommender-api listening on port ${PORT}`);
});
