import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import problemsRouter from './routes/problems';
import votesRouter from './routes/votes';
import analyticsRouter from './routes/analytics';
import uploadRouter from './routes/upload';

const app = express();

// Security & parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Allow Telegram SDK and Leaflet CDN
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Static files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use(express.static(path.resolve(__dirname, '../public')));

// API Routes
app.use('/api/problems', problemsRouter);
app.use('/api/vote', votesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// Error handler
app.use(errorHandler);

export default app;
