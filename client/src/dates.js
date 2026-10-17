const fullFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const shortFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric', month: 'long', year: 'numeric',
});

export const formatFull = (iso) => fullFormatter.format(new Date(iso));
export const formatShort = (iso) => shortFormatter.format(new Date(iso));

export function countdown(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { value: '0', unit: 'уже в дорозі' };

  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return { value: String(minutes), unit: 'хв' };

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return { value: String(hours), unit: 'год' };

  const days = Math.floor(hours / 24);
  if (days < 60) return { value: String(days), unit: 'днів' };

  const months = Math.floor(days / 30);
  if (months < 24) return { value: String(months), unit: 'міс' };

  return { value: String(Math.floor(days / 365)), unit: 'років' };
}

export function toInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function defaultOpenAtValue() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return toInputValue(d);
}