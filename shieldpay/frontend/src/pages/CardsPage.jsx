import React from 'react';
import { api } from '../api.js';

export default function CardsPage() {
  const [cards, setCards] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/cards');
        if (mounted) setCards(data.cards || []);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Cards</div>
          <div className="pageSub">Lab-only: PAN/CVV are returned by the API in v1.</div>
        </div>
      </div>

      {error ? <div className="note">{error}</div> : null}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Brand</th>
            <th>Last4</th>
            <th>Exp</th>
            <th>PAN (unsafe)</th>
            <th>CVV (unsafe)</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id}>
              <td>#{c.id}</td>
              <td className="muted">#{c.customer_id}</td>
              <td>{c.brand}</td>
              <td>{c.last4}</td>
              <td className="muted">{String(c.exp_month).padStart(2, '0')}/{c.exp_year}</td>
              <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{c.pan}</td>
              <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{c.cvv}</td>
            </tr>
          ))}
          {cards.length === 0 ? (
            <tr><td colSpan={7} className="muted">No cards found.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

