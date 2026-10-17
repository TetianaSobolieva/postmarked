import nodemailer from 'nodemailer';

const driver = process.env.MAIL_DRIVER || 'console';
let transporter = null;

if (driver === 'smtp') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function verifyMailer() {
  if (!transporter) {
    console.log('[mail] драйвер "console": листи друкуються в термінал');
    return;
  }
  try {
    await transporter.verify();
    console.log("[mail] SMTP-зʼєднання готове");
  } catch (err) {
    console.error('[mail] SMTP не відповідає:', err.message);
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function sendLetterEmail(to, letter) {
  const subject = `Лист від тебе: ${letter.title}`;

  if (!transporter) {
    console.log('\n──── ЛИСТ (console) ────');
    console.log('Кому:', to);
    console.log('Тема:', subject);
    console.log(letter.body);
    console.log('────────────────────────\n');
    return { mocked: true };
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: `${letter.title}\n\n${letter.body}`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;line-height:1.7">
             <h2>${escapeHtml(letter.title)}</h2>
             <div style="white-space:pre-wrap">${escapeHtml(letter.body)}</div>
           </div>`,
  });
}