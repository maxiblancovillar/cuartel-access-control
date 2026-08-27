import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import apiRoutes from '@/api/routes';
import { errorHandler } from '@/api/middlewares/errorHandler';

/**
 * Construye y configura la app de Express sin arrancar el servidor HTTP.
 * Separado de main.ts para poder importar `app` en tests (supertest)
 * sin disparar app.listen().
 */
export function createApp() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({
      level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || 'info',
    })
  );

  // Routes
  app.use('/api/v1', apiRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Error handler (debe ser último)
  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;
