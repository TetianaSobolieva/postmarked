import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { setAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email('Перевір адресу пошти').toLowerCase().trim(),
  password: z.string().min(8, 'Пароль має бути щонайменше 8 символів'),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Акаунт із такою поштою вже є. Увійди.' });
    }

    const user = await prisma.user.create({
      data: { email, password: await bcrypt.hash(password, 10) },
      select: { id: true, email: true },
    });

    setAuthCookie(res, user.id);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Введи пошту й пароль' });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(401).json({ error: 'Пошта або пароль не підходять' });
    }

    setAuthCookie(res, user.id);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Користувача не знайдено' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});