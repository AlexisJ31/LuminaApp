import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transaction.routes';
import authRoutes from './routes/auth.routes';
import webhookRoutes from './routes/webhook.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración restringida de CORS para producción / staging
const allowedOrigins = [
  'https://luminaapp-alexis.netlify.app',
  'https://luminaapp.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`Acceso denegado por política de CORS: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json());

// Check de salud de la API
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LuminaApp Financial API',
    version: '1.0.0-phase4',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1', transactionRoutes);


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 LuminaApp Backend API corriendo en el puerto ${PORT}`);
  });
}

export default app;
