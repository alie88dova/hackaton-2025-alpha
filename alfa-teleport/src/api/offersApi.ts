import type { Offer, OffersResponse, ClientInfo } from '../types';

const API_BASE_URL = "http://localhost:8000";

// если нет урла бэка — включаем моки
const USE_MOCKS = !API_BASE_URL;

function mockDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- типы под ответ FastAPI ----------

interface BackendOffer {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  description: string;
  highlight?: string;
  rate?: number;
  termMonths?: number;
  amountFrom?: number;
  amountTo?: number;
}

interface BackendClientInfo {
  age: number;
  region: string;
  official_salary?: number | null;
}

interface BackendResponse {
  client_id: number;
  predicted_income: number;
  offer: BackendOffer[];
  client_info: BackendClientInfo;
}

// маппер JSON -> типы фронта
function mapBackendToOffersResponse(payload: BackendResponse): OffersResponse {
  const clientInfo: ClientInfo = {
    age: payload.client_info.age,
    region: payload.client_info.region,
    officialSalary:
      payload.client_info.official_salary !== undefined
        ? payload.client_info.official_salary
        : null,
  };

  const offers: Offer[] = payload.offer.map((o) => ({
    id: o.id,
    kind: o.kind,
    title: o.title,
    subtitle: o.subtitle,
    description: o.description,
    highlight: o.highlight,
    rate: o.rate,
    termMonths: o.termMonths,
    amountFrom: o.amountFrom,
    amountTo: o.amountTo,
  }));

  return {
    clientId: String(payload.client_id),
    offers,
    predictedIncome: payload.predicted_income,
    clientInfo,
  };
}

// ---------- МОКИ, если бэк не подключен ----------

async function fetchOffersMock(clientId: string): Promise<OffersResponse> {
  await mockDelay(700);

  const offers: Offer[] = [
    {
      id: 'ref-1',
      kind: 'Рефинансирование',
      title: 'Платите в 2 раза меньше',
      subtitle: 'Объединим кредиты и снизим ежемесячный платёж',
      description:
        'Перенесём ваши действующие кредиты в Альфа-Банк, снизим ставку и сделаем один комфортный платёж вместо нескольких.',
      rate: 11.5,
      termMonths: 60,
      amountFrom: 200_000,
      amountTo: 3_000_000,
      highlight: 'Снижение общей переплаты и одного платежа вместо нескольких.',
    },
    {
      id: 'inv-1',
      kind: 'Инвестиции',
      title: 'Инвестиции под контролем',
      subtitle: 'Готовое решение для аккуратного роста капитала',
      description:
        'Подбор консервативной инвестиционной стратегии с учётом профиля клиента. Надёжные инструменты и диверсификация рисков.',
      rate: 9.8,
      termMonths: 24,
      amountFrom: 50_000,
      amountTo: 1_000_000,
      highlight: 'Лучше депозита при контролируемом уровне риска.',
    },
    {
      id: 'card-travel-1',
      kind: 'Кредитная карта',
      title: 'Alfa Travel',
      subtitle: 'Путешествия выгоднее',
      description:
        'До 10% милями за авиабилеты и отели, бесплатная страховка в поездках и доступ в бизнес-залы.',
      rate: 11.99,
      termMonths: 36,
      amountFrom: 10_000,
      amountTo: 300_000,
      highlight: 'Кэшбэк милями за каждую покупку.',
    },
    {
      id: 'cash-loan-1',
      kind: 'Кредит наличными',
      title: 'Деньги на любые цели',
      subtitle: 'Одобрение за 2 минуты',
      description:
        'Нужен только паспорт. Деньги поступят на карту сразу после одобрения в приложении.',
      rate: 15.9,
      termMonths: 60,
      amountFrom: 50_000,
      amountTo: 1_000_000,
      highlight: 'Быстрое решение без лишних документов.',
    },
  ];

  return { clientId, offers };
}

export async function fetchOffers(clientId: string): Promise<OffersResponse> {
  if (!clientId.trim()) {
    throw new Error('ID клиента не может быть пустым');
  }

  // если указан адрес бэка — используем ТОЛЬКО его
  if (API_BASE_URL) {
    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/api/predict/${encodeURIComponent(clientId)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      let detail = '';
      try {
        const errorBody = await res.json();
        detail =
          typeof (errorBody as any).detail === 'string'
            ? (errorBody as any).detail
            : JSON.stringify((errorBody as any).detail);
      } catch {
        // ignore
      }
      throw new Error(
        detail || `Ошибка сервера: ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as BackendResponse;
    return mapBackendToOffersResponse(data);
  }

  // иначе — моки (локальный режим)
  //return fetchOffersMock(clientId);
}
