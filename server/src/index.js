import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.js';
import { lettersRouter } from './routes/letters.js';

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Не заданий ${key}. Перевір файл .env`);
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));
app.use('/api/auth', authRouter);
app.use('/api/letters', lettersRouter);

app.use((req, res) => res.status(404).json({ error: 'Такого маршруту немає' }));

app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Щось зламалося на сервері' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`[server] слухає http://localhost:${port}`);
});