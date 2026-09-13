import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transaction.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Check de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LuminaApp Financial API', timestamp: new Date() });
});

// Rutas de API v1
app.use('/api/v1', transactionRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 LuminaApp Backend API corriendo en el puerto ${PORT}`);
  });
}

export default app;
