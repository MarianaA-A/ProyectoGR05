require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');

const { getDbConnection } = require('./db/db-connection-mongo');

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origen no permitido por CORS'));
  }
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas
app.use('/api/generos', require('./routes/genero'));
app.use('/api/directores', require('./routes/director'));
app.use('/api/productoras', require('./routes/productora'));
app.use('/api/tipos', require('./routes/tipo'));
app.use('/api/medias', require('./routes/media'));

getDbConnection();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
