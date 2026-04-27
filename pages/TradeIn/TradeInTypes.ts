export interface TradeInData {
  category?: string;
  zipCode?: string;
  brand?: string;
  model?: string;
  series?: string;
  subseries?: string;
  device?: string;
  storage?: string;
  color?: string;
  purchaseFrom?: string;
  IMEI?: string;
}

export interface ParsedTradeInValue {
  currency: string;
  amount: number;
  amountString: string;
  amountStringNoDecimal: string;
  originalText: string;
}

export type StepConfig = Record<string, { BC?: string[]; CART?: string[] }>;
export type StepMethod = (data: TradeInData) => Promise<void>;
