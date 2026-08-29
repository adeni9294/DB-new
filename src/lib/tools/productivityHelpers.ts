export interface BillSplitItem {
  id: string;
  name: string;
  amount: number;
}

export interface BillSplitResult {
  totalAmount: number;
  taxAmount: number;
  serviceAmount: number;
  grandTotal: number;
  perPersonShare: number;
}

export function calculateSplitBill(
  subtotal: number,
  taxPercent: number,
  servicePercent: number,
  personCount: number
): BillSplitResult {
  const taxAmount = subtotal * (taxPercent / 100);
  const serviceAmount = subtotal * (servicePercent / 100);
  const grandTotal = subtotal + taxAmount + serviceAmount;
  const perPersonShare = personCount > 0 ? grandTotal / personCount : grandTotal;

  return {
    totalAmount: subtotal,
    taxAmount,
    serviceAmount,
    grandTotal,
    perPersonShare,
  };
}

export function convertUnit(val: number, fromUnit: string, toUnit: string): number {
  // Contoh konversi sederhana (Panjang/Massa)
  const rates: Record<string, number> = {
    m: 1,
    km: 1000,
    cm: 0.01,
    kg: 1,
    g: 0.001,
  };

  if (rates[fromUnit] && rates[toUnit]) {
    const baseVal = val * rates[fromUnit];
    return baseVal / rates[toUnit];
  }
  return val;
}
