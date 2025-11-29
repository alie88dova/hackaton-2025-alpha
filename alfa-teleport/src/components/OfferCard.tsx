import type { Offer } from '../types';

interface OfferCardProps {
  offer: Offer;
  index: number;
}

const kindLabel: Record<Offer['kind'], string> = {
  refinance: 'Рефинансирование',
  investment: 'Инвестиции',
};

const riskLabel: Record<NonNullable<Offer['riskLevel']>, string> = {
  low: 'Низкий риск',
  medium: 'Умеренный риск',
  high: 'Повышенный риск',
};

export function OfferCard({ offer, index }: OfferCardProps) {
  const delay = index * 80; // небольшая задержка для "каскада"

  return (
    <article
      className="offer-card offer-card--enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="offer-card__header">
        <span className={`offer-card__badge offer-card__badge--${offer.kind}`}>
          {kindLabel[offer.kind]}
        </span>
        {offer.highlight && (
          <span className="offer-card__badge offer-card__badge--highlight">
            {offer.highlight}
          </span>
        )}
      </header>

      <h3 className="offer-card__title">{offer.title}</h3>
      <p className="offer-card__subtitle">{offer.subtitle}</p>

      <p className="offer-card__description">{offer.description}</p>

      <div className="offer-card__grid">
        {offer.rate && (
          <div className="offer-card__info">
            <span className="offer-card__info-label">Ставка от</span>
            <span className="offer-card__info-value">
              {offer.rate.toFixed(1)}%
            </span>
          </div>
        )}

        {offer.termMonths && (
          <div className="offer-card__info">
            <span className="offer-card__info-label">Срок до</span>
            <span className="offer-card__info-value">
              {offer.termMonths} мес.
            </span>
          </div>
        )}

        {(offer.amountFrom || offer.amountTo) && (
          <div className="offer-card__info">
            <span className="offer-card__info-label">Сумма</span>
            <span className="offer-card__info-value">
              {offer.amountFrom
                ? `от ${offer.amountFrom.toLocaleString('ru-RU')} ₽`
                : ''}
              {offer.amountTo
                ? ` до ${offer.amountTo.toLocaleString('ru-RU')} ₽`
                : ''}
            </span>
          </div>
        )}
      </div>

    </article>
  );
}
