import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { defaultOpenAtValue, toInputValue } from '../dates.js';

const PRESETS = [
  { label: 'Через місяць', apply: (d) => d.setMonth(d.getMonth() + 1) },
  { label: 'Через пів року', apply: (d) => d.setMonth(d.getMonth() + 6) },
  { label: 'Через рік', apply: (d) => d.setFullYear(d.getFullYear() + 1) },
  { label: 'Через 5 хвилин', apply: (d) => d.setMinutes(d.getMinutes() + 5) },
];

export function Compose() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [openAt, setOpenAt] = useState(defaultOpenAtValue);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function applyPreset(preset) {
    const d = new Date();
    preset.apply(d);
    setOpenAt(toInputValue(d));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      // datetime-local дає локальний час без зони — перетворюємо на ISO (UTC)
      await api.createLetter({ title, body, openAt: new Date(openAt).toISOString() });
      navigate('/letters');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="compose">
      <h1>Новий лист</h1>
      <p className="lede">
        Щойно запечатаєш — прочитати не вийде ні тобі, ні через код сторінки. Тільки в призначений
        день, на пошту.
      </p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <label className="field">
          <span>Заголовок</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Коли нарешті здам цей проєкт"
            required
          />
          <p className="hint">Це єдине, що ти бачитимеш до розпечатування.</p>
        </label>

        <label className="field">
          <span>Лист</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Привіт. Пишу тобі з понеділка, і ось що зараз важливо…"
            required
          />
        </label>

        <label className="field">
          <span>Розпечатати</span>
          <input
            type="datetime-local"
            value={openAt}
            onChange={(e) => setOpenAt(e.target.value)}
            required
          />
        </label>

        <div className="compose-actions" style={{ marginTop: '-0.5rem' }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="button quiet"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="compose-actions">
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Запечатуємо…' : 'Запечатати лист'}
          </button>
          <button className="button ghost" type="button" onClick={() => navigate('/letters')}>
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}
