import cron from 'node-cron';
import { prisma } from './db.js';
import { sendLetterEmail } from './mailer.js';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 50;

export async function deliverDueLetters() {
  const now = new Date();

  // 1. Забираємо порцію й одразу позначаємо SENDING, в одній транзакції
  const due = await prisma.$transaction(async (tx) => {
    const found = await tx.letter.findMany({
      where: { status: 'SEALED', openAt: { lte: now } },
      include: { user: { select: { email: true } } },
      orderBy: { openAt: 'asc' },
      take: BATCH_SIZE,
    });

    if (found.length > 0) {
      await tx.letter.updateMany({
        where: { id: { in: found.map((l) => l.id) }, status: 'SEALED' },
        data: { status: 'SENDING' },
      });
    }
    return found;
  });

  if (due.length === 0) return { delivered: 0, failed: 0 };

  let delivered = 0;
  let failed = 0;

  // 2. Надсилаємо кожен
  for (const letter of due) {
    try {
      await sendLetterEmail(letter.user.email, letter);
      await prisma.letter.update({
        where: { id: letter.id },
        data: { status: 'DELIVERED', sentAt: new Date(), mailError: null },
      });
      delivered += 1;
      console.log(`[cron] надіслано "${letter.title}" → ${letter.user.email}`);
    } catch (err) {
      const attempts = letter.attempts + 1;
      const giveUp = attempts >= MAX_ATTEMPTS;

      await prisma.letter.update({
        where: { id: letter.id },
        data: {
          status: giveUp ? 'DELIVERED' : 'SEALED',
          attempts,
          mailError: err.message?.slice(0, 500) ?? 'unknown error',
          sentAt: giveUp ? new Date() : null,
        },
      });
      failed += 1;
      console.error(`[cron] помилка ${letter.id} (спроба ${attempts}):`, err.message);
    }
  }

  return { delivered, failed };
}

export function startCron() {
  const schedule = process.env.CRON_SCHEDULE || '*/5 * * * *';

  if (!cron.validate(schedule)) {
    throw new Error(`Невалідний CRON_SCHEDULE: ${schedule}`);
  }

  cron.schedule(schedule, () => {
    deliverDueLetters().catch((err) => console.error('[cron] збій:', err));
  });
  console.log(`[cron] розклад "${schedule}" активний`);

  // Одразу при старті: наздоганяємо все, що накопичилось, поки сервер спав
  deliverDueLetters().catch((err) => console.error('[cron] стартовий збій:', err));
}