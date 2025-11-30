export interface Offer {
  id: string;
  /**
   * Тип продукта, прилетает с бэка как текст:
   * "Рефинансирование", "Бизнес", "Кредитная карта", "Кредит наличными" и т.д.
   */
  kind: string;
  title: string;
  subtitle: string;
  description: string;
  rate?: number;        // ставка, %
  termMonths?: number;  // срок в месяцах
  amountFrom?: number;  // сумма от
  amountTo?: number;    // сумма до
  riskLevel?: 'low' | 'medium' | 'high';
  highlight?: string;
}

export interface ClientInfo {
  age: number;
  region: string;
  officialSalary?: number | null;
}

export interface OffersResponse {
  clientId: string;
  offers: Offer[];
  predictedIncome?: number;
  clientInfo?: ClientInfo;
}
