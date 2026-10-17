import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { countdown, formatFull } from '../dates.js';

export function Letters() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .listLetters()
      .then(({ letters }) => setLetters(letters))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  async function handleDelete(letter) {
    if (!window.confirm(`Порвати «${letter.title}»?`)) return;
    try {
      await api.deleteLetter(letter.id);
      setLetters((prev) => prev.filter((l) => l.id !== letter.id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Перебираємо стос…</p>;

  const sealed = letters.filter((l) => l.status !== 'DELIVERED');
  const delivered = letters.filter((l) => l.status === 'DELIVERED');

  return (
    <>
      {error && <div className="error">{error}</div>}

      <h2>Доставлені ({delivered.length})</h2>
      {delivered.map((l) => (
        <Link key={l.id} className="envelope open" to={`/letters/${l.id}`}>
          <div className="subject">{l.title}</div>
          <div className="meta">Розпечатаний {formatFull(l.openAt)}</div>
        </Link>
      ))}

      <h2>Запечатані ({sealed.length})</h2>
      {sealed.map((l) => {
        const { value, unit } = countdown(l.openAt);
        return (
          <div key={l.id} className="envelope sealed">
            <div className="subject">{l.title}</div>
            <div className="meta">Відкриється {formatFull(l.openAt)}</div>
            <div className="seal">{value} {unit}</div>
            <button type="button" onClick={() => handleDelete(l)}>Порвати конверт</button>
          </div>
        );
      })}
    </>
  );
}