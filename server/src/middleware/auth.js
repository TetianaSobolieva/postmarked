import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 днів

const isProd = process.env.NODE_ENV === 'production';

/**
 * Кладемо JWT у httpOnly-cookie, а не в localStorage:
 * з localStorage токен забирає будь-який XSS, з httpOnly-cookie — ні.
 *
 * У проді фронт (Vercel) і бек (Render) на різних доменах, тому потрібні
 * sameSite: 'none' + secure: true. Локально обидва на localhost — це той
 * самий site, тож вистачає 'lax' без https.
 */
export function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Потрібен вхід' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    clearAuthCookie(res);
    return res.status(401).json({ error: 'Сесія протермінована, увійди знову' });
  }
}
