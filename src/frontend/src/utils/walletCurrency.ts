import type { Currency } from '../backend';
import { Variant_op_bnb_etc_eth_star } from '../backend';

/**
 * Convert backend Currency variant to user-facing currency code
 */
export function currencyToCode(currency: Currency): string {
  if (currency.__kind__ === 'usd') return 'USD';
  if (currency.__kind__ === 'bdt') return 'BDT';
  if (currency.__kind__ === 'btc') return 'BTC';
  if (currency.__kind__ === 'eth') return 'ETH';
  if (currency.__kind__ === 'usdt') {
    const network = currency.usdt;
    return `USDT-${network.toUpperCase()}`;
  }
  if (currency.__kind__ === 'other') return currency.other.toUpperCase();
  return 'UNKNOWN';
}

/**
 * Convert backend Currency variant to user-facing label
 */
export function currencyToLabel(currency: Currency): string {
  if (currency.__kind__ === 'usd') return 'US Dollar';
  if (currency.__kind__ === 'bdt') return 'Bangladeshi Taka';
  if (currency.__kind__ === 'btc') return 'Bitcoin';
  if (currency.__kind__ === 'eth') return 'Ethereum';
  if (currency.__kind__ === 'usdt') {
    const network = currency.usdt;
    return `USDT (${network.toUpperCase()})`;
  }
  if (currency.__kind__ === 'other') return currency.other;
  return 'Unknown Currency';
}

/**
 * Format wallet amount (stored as smallest unit, e.g., cents for fiat)
 * For crypto, we assume 8 decimal places (satoshis/wei equivalent)
 */
export function formatWalletAmount(amount: bigint, currency: Currency): string {
  const code = currencyToCode(currency);
  
  // Fiat currencies (2 decimal places)
  if (currency.__kind__ === 'usd' || currency.__kind__ === 'bdt') {
    const value = Number(amount) / 100;
    return `${code} ${value.toFixed(2)}`;
  }
  
  // Crypto currencies (8 decimal places)
  if (currency.__kind__ === 'btc' || currency.__kind__ === 'eth' || currency.__kind__ === 'usdt') {
    const value = Number(amount) / 100000000;
    return `${value.toFixed(8)} ${code}`;
  }
  
  // Other currencies (default to 2 decimal places)
  const value = Number(amount) / 100;
  return `${code} ${value.toFixed(2)}`;
}

/**
 * Create Currency object from code string
 */
export function codeToCurrency(code: string): Currency {
  const upperCode = code.toUpperCase();
  
  if (upperCode === 'USD') return { __kind__: 'usd', usd: null };
  if (upperCode === 'BDT') return { __kind__: 'bdt', bdt: null };
  if (upperCode === 'BTC') return { __kind__: 'btc', btc: null };
  if (upperCode === 'ETH') return { __kind__: 'eth', eth: null };
  if (upperCode.startsWith('USDT')) {
    // Default to ETH network if not specified
    return { __kind__: 'usdt', usdt: Variant_op_bnb_etc_eth_star.eth };
  }
  
  return { __kind__: 'other', other: code };
}

/**
 * Convert user input amount to smallest unit (cents/satoshis)
 */
export function amountToSmallestUnit(amount: number, currency: Currency): bigint {
  // Fiat currencies (2 decimal places)
  if (currency.__kind__ === 'usd' || currency.__kind__ === 'bdt') {
    return BigInt(Math.round(amount * 100));
  }
  
  // Crypto currencies (8 decimal places)
  if (currency.__kind__ === 'btc' || currency.__kind__ === 'eth' || currency.__kind__ === 'usdt') {
    return BigInt(Math.round(amount * 100000000));
  }
  
  // Other currencies (default to 2 decimal places)
  return BigInt(Math.round(amount * 100));
}
