import type { Offer, OffersResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

// флаг: если нет базового урла, включаем моки
const USE_MOCKS = !API_BASE_URL;

function mockDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOffersMock(clientId: string): Promise<OffersResponse> {
  await mockDelay(700); // имитация сети

  const offers: Offer[] = [
    {
      id: 'refinance-1',
      kind: 'refinance',
      title: 'Рефинансирование без лишних хлопот',
      subtitle: 'Снизим ежемесячный платёж и объединим кредиты',
      description:
        'Перенесём ваши действующие кредиты в Альфа-Банк, снизим ставку и упростим обслуживание. Решение онлайн, без лишних визитов.',
      rate: 11.5,
      termMonths: 60,
      amountFrom: 200_000,
      amountTo: 3_000_000,
      riskLevel: 'low',
      highlight: 'Снижение общей переплаты и одного платежа вместо нескольких.',
    },
    {
      id: 'investment-1',
      kind: 'investment',
      title: 'Инвестиции под контролем',
      subtitle: 'Готовое решение для аккуратного роста капитала',
      description:
        'Подбор консервативной инвестиционной стратегии с учётом вашего профиля. Инвестиции в надёжные инструменты с диверсификацией рисков.',
      rate: 9.8,
      termMonths: 24,
      amountFrom: 50_000,
      amountTo: 1_000_000,
      riskLevel: 'medium',
      highlight: 'Лучше депозита при контролируемом уровне риска.',
    },
  ];

  return { clientId, offers };
}

export async function fetchOffers(clientId: string): Promise<OffersResponse> {
  if (!clientId.trim()) {
    throw new Error('ID клиента не может быть пустым');
  }

  // Реальный бэкенд
  if (API_BASE_URL && !USE_MOCKS) {
    const url = `${API_BASE_URL.replace(/\/$/, '')}/offers?clientId=${encodeURIComponent(
      clientId,
    )}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Ошибка сервера: ${res.status}`);
    }

    const data = (await res.json()) as OffersResponse;
    return data;
  }

  // Пока бэка нет — моки
  return fetchOffersMock(clientId);
}
