export type OfferKind = 'refinance' | 'investment';

export interface Offer {
  id: string;
  kind: OfferKind;
  title: string;
  subtitle: string;
  description: string;
  rate?: number;        // ставка, %
  termMonths?: number;  // срок в месяцах
  amountFrom?: number;  // сумма от
  amountTo?: number;    // сумма до
  riskLevel?: 'low' | 'medium' | 'high';
  highlight?: string;   // короткий selling point
}

export interface OffersResponse {
  clientId: string;
  offers: Offer[];
}
