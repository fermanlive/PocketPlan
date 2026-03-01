require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const monthDataService = require('./services/monthDataService');
const monthDataRoutes = require('./routes/monthData.routes');
const authRoutes = require('./routes/auth.routes');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  let mongoConnected = false;
  try {
    await connectDB();
    mongoConnected = true;
  } catch (err) {
    console.warn('[DB] Fallo MongoDB, usando mock:', err.message);
  }

  await monthDataService.init(mongoConnected);

  if (mongoConnected) {
    app.use('/api/auth', authRoutes);
    app.use('/api', authenticateToken, monthDataRoutes);
  } else {
    app.use('/api/auth', (req, res) => {
      res.status(503).json({ error: 'Auth requiere MongoDB. Verifica la conexión a la base de datos.' });
    });
    app.use('/api', (req, res) => {
      res.status(503).json({ error: 'Base de datos no disponible. Verifica la conexión a MongoDB.' });
    });
  }
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'pocketplan-read-microservices',
      database: mongoConnected ? 'mongodb' : 'mock',
    });
  });

  app.listen(PORT, () => {
    console.log(`Server en puerto ${PORT} — DB: ${mongoConnected ? 'MongoDB Atlas' : 'Mock JSON'}`);
  });
}

startServer().catch(console.error);

module.exports = app;
