// Conversion rate from USD to RWF (as of March 2024)
const USD_TO_RWF = 1300;

export function convertToRWF(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_RWF);
}

export function formatRWF(amount: number): string {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(price: number): string {
  const rwfAmount = convertToRWF(price);
  return formatRWF(rwfAmount);
} 