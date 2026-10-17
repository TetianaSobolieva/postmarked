import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { formatFull } from '../dates.js';

export function LetterView() {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    api
      .getLetter(id)
      .then(({ letter }) => {
        if (!alive) return;
        setLetter(letter);
        setState({ status: 'ready' });
      })
      .catch((err) => {
        if (!alive) return;
        setState({ status: err.status === 423 ? 'sealed' : 'error', error: err });
      });
    return () => { alive = false; };
  }, [id]);

  if (state.status === 'loading') return <p>Відкриваємо конверт…</p>;

  if (state.status === 'sealed') {
    return (
      <div className="letter-sheet">
        <h1>{state.error.payload?.title}</h1>
        <p>Відкриється {formatFull(state.error.payload.openAt)}.</p>
        <Link to="/letters">Назад</Link>
      </div>
    );
  }

  if (state.status === 'error') {
    return <div className="error">{state.error.message}</div>;
  }

  return (
    <article className="letter-sheet">
      <h1>{letter.title}</h1>
      <div className="body">{letter.body}</div>
      <Link to="/letters">Назад</Link>
    </article>
  );
}