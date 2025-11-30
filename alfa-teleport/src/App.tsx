import { FormEvent, useState } from 'react';
import { fetchOffers } from './api/offersApi';
import type { Offer } from './types';
import { OfferCard } from './components/OfferCard';

type Status = 'idle' | 'loading' | 'success' | 'error';

function App() {
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [returnedClientId, setReturnedClientId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientId.trim()) {
      setErrorMessage('Введите ID клиента');
      return;
    }

    try {
      setStatus('loading');
      const data = await fetchOffers(clientId.trim());
      setOffers(data.offers);
      setReturnedClientId(data.clientId);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.message || 'Не удалось получить предложения. Попробуйте ещё раз.',
      );
      setStatus('error');
    }
  }

  const showOffers = status === 'success' && offers.length > 0;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">А</div>
        <div className="app-title">
          <div className="app-title-main">Альфа · предложения по доходу</div>
          <div className="app-title-sub">
            Рефинансирование и инвестиции на основе модели дохода клиента
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-layout">
          {/* Левая колонка — форма */}
          <section className="panel panel--primary">
            <h1 className="panel__title">Подбор предложений по ID клиента</h1>
            <p className="panel__subtitle">
              Введите ID клиента, мы отправим его на сервер и получим набор
              персональных предложений: рефинансирование и инвестиции.
            </p>

            <form className="form" onSubmit={handleSubmit}>
              <label className="form__label">
                ID клиента
                <input
                  className="form__input"
                  placeholder="Например, 123456789"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </label>

              {errorMessage && (
                <div className="form__error">{errorMessage}</div>
              )}

              <div className="form__actions">
                <button
                  className="btn"
                  type="submit"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Загружаем...' : 'Получить предложения'}
                </button>

                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setClientId('123456')}
                >
                  Подставить демо-ID
                </button>
              </div>

              <p className="form__hint">
              </p>
            </form>
          </section>

          {/* Правая колонка — карточки предложений */}
          <section className="panel panel--secondary">
            <div className="panel__header">
              <h2 className="panel__title">Предложения для клиента</h2>
              {returnedClientId && (
                <span className="panel__pill">
                  ID клиента: <strong>{returnedClientId}</strong>
                </span>
              )}
            </div>

            {status === 'idle' && (
              <p className="muted">
                Здесь появятся карточки рефинансирования и инвестиций после
                отправки ID клиента.
              </p>
            )}

            {status === 'loading' && (
              <div className="offers-grid">
                <div className="offer-skeleton" />
                <div className="offer-skeleton" />
              </div>
            )}

            {status === 'error' && !showOffers && (
              <p className="form__error form__error--inline">
                {errorMessage ||
                  'Что-то пошло не так. Попробуйте ещё раз или позже.'}
              </p>
            )}

            {showOffers && (
              <div className="offers-grid">
                {offers.map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} index={index} />
                ))}
              </div>
            )}

            {status === 'success' && !offers.length && (
              <p className="muted">
                Для этого клиента предложения не найдены. Попробуйте другой ID.
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <span>
          Прототип для Hack&Change 2025 
        </span>
      </footer>
    </div>
  );
}

export default App;
