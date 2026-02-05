/**
 * Format a payment amount (in cents as bigint) with the given ISO 4217 currency code.
 * Uses Intl.NumberFormat for proper localization when available.
 * Falls back to "CODE amount" format if formatting fails.
 */
export function formatCurrency(amountInCents: bigint, currencyCode: string): string {
  try {
    const amount = Number(amountInCents) / 100;
    
    // Try to use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback if currency code is not recognized
    const amount = (Number(amountInCents) / 100).toFixed(2);
    return `${currencyCode.toUpperCase()} ${amount}`;
  }
}
