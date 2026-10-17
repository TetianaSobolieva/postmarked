import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const lettersRouter = Router();

lettersRouter.use(requireAuth);

const MIN_DELAY_MS = 60 * 1000;
const MAX_DELAY_MS = 20 * 365 * 24 * 60 * 60 * 1000;

const letterSchema = z.object({
  title: z.string().trim().min(1, 'Дай листу заголовок').max(120, 'Заголовок задовгий'),
  body: z.string().trim().min(1, 'Лист порожній').max(20000, 'Лист задовгий'),
  openAt: z
    .string()
    .min(1, 'Обери дату розпечатування')
    .transform((value, ctx) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: 'custom', message: 'Невірна дата розпечатування' });
        return z.NEVER;
      }
      return date;
    }),
});

// Список: БЕЗ поля body
lettersRouter.get('/', async (req, res, next) => {
  try {
    const letters = await prisma.letter.findMany({
      where: { userId: req.userId },
      orderBy: { openAt: 'asc' },
      select: {
        id: true,
        title: true,
        openAt: true,
        status: true,
        sentAt: true,
        createdAt: true,
      },
    });
    res.json({ letters });
  } catch (err) {
    next(err);
  }
});

// Один лист: тут перевіряємо запечатаність
lettersRouter.get('/:id', async (req, res, next) => {
  try {
    const letter = await prisma.letter.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!letter) return res.status(404).json({ error: 'Такого листа немає' });

    if (letter.status !== 'DELIVERED') {
      return res.status(423).json({
        error: 'Лист ще запечатаний',
        openAt: letter.openAt,
        title: letter.title,
      });
    }

    res.json({ letter });
  } catch (err) {
    next(err);
  }
});

lettersRouter.post('/', async (req, res, next) => {
  try {
    const parsed = letterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { title, body, openAt } = parsed.data;

    const delta = openAt.getTime() - Date.now();
    if (delta < MIN_DELAY_MS) {
      return res.status(400).json({ error: 'Обери час щонайменше на хвилину вперед' });
    }
    if (delta > MAX_DELAY_MS) {
      return res.status(400).json({ error: 'Максимальний строк — 20 років' });
    }

    const letter = await prisma.letter.create({
      data: { title, body, openAt, userId: req.userId },
      select: { id: true, title: true, openAt: true, status: true, createdAt: true },
    });
    res.status(201).json({ letter });
  } catch (err) {
    next(err);
  }
});

lettersRouter.delete('/:id', async (req, res, next) => {
  try {
    const letter = await prisma.letter.findFirst({
      where: { id: req.params.id, userId: req.userId },
      select: { id: true },
    });
    if (!letter) return res.status(404).json({ error: 'Такого листа немає' });

    await prisma.letter.delete({ where: { id: letter.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});