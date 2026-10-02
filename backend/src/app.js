import cors from 'cors';
import express from 'express';
import connectDB from './config/db.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import notFoundMiddleware from './middleware/notFoundMiddleware.js';
import { getRobots, getSitemap } from './controllers/seoController.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

const localOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(['production', '1'].includes(process.env.NODE_ENV) || process.env.VERCEL === '1' ? [] : localOrigins),
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(Object.assign(new Error('Origin not allowed.'), { statusCode: 403 }));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (request, response, next) => {
  if (['/api/health', '/robots.txt', '/api/seo/robots.txt'].includes(request.path)) {
    next();
    return;
  }

  try {
    await connectDB();
    if (!process.env.MONGO_URI) {
      response.status(503).json({ success: false, message: 'Database connection is not configured.' });
      return;
    }
    next();
  } catch {
    response.status(503).json({ success: false, message: 'Database connection is unavailable.' });
  }
});

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'API is running',
  });
});

app.get('/robots.txt', getRobots);
app.get('/sitemap.xml', getSitemap);
app.get('/api/seo/robots.txt', getRobots);
app.get('/api/seo/sitemap.xml', getSitemap);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;