require('dotenv').config();
const express = require('express');
const cors = require('cors');
const monthDataRoutes = require('./routes/monthData.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', monthDataRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'pocketplan-read-microservices',
    database: 'mock'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
