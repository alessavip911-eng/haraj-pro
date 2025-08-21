
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { router as auth } from './routes/auth.js';
import { router as listings } from './routes/listings.js';

const app = express();
const PORT = process.env.PORT || 8080;
const origin = process.env.CORS_ORIGIN || '*';

app.use(helmet());
app.use(cors({ origin }));
app.use(express.json({ limit: '5mb' }));
app.use(pinoHttp());

const limiter = rateLimit({
  windowMs: 60_000,
  max: 120
});
app.use(limiter);

// Docs
const openapiPath = path.join(process.cwd(), 'src', 'openapi.json');
if (fs.existsSync(openapiPath)) {
  const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth);
app.use('/api/listings', listings);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

app.listen(PORT, () => {
  console.log(`API running on :${PORT}`);
});
