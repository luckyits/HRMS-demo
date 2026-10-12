export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD'

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
}

// Exchange rates normalized against INR (Mock base for multi-currency display)
export const INR_EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  INR: 1,
  USD: 0.012, // 1 INR = ~0.012 USD (1 USD = ~83.5 INR)
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  SGD: 0.016,
}

/**
 * Format a number into standard Indian or International currency representation
 */
export function formatCurrency(
  amountInInr: number,
  targetCurrency: SupportedCurrency = 'INR',
  options?: { showSymbol?: boolean; decimals?: number; locale?: 'en' | 'hi' | 'gu' }
): string {
  const showSymbol = options?.showSymbol ?? true
  const decimals = options?.decimals ?? 0
  const rate = INR_EXCHANGE_RATES[targetCurrency] || 1
  const converted = amountInInr * rate

  const symbol = showSymbol ? CURRENCY_SYMBOLS[targetCurrency] : ''
  const locale = options?.locale || 'en'
  const loc = locale === 'hi' ? 'hi-IN' : locale === 'gu' ? 'gu-IN' : 'en-IN'

  if (targetCurrency === 'INR') {
    return `${symbol}${converted.toLocaleString(loc, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`
  }

  return `${symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

/**
 * Format a number with Indian numbering conventions (lakhs/crores) and language locales
 */
export function formatNumber(
  num: number,
  locale: 'en' | 'hi' | 'gu' = 'en'
): string {
  const loc = locale === 'hi' ? 'hi-IN' : locale === 'gu' ? 'gu-IN' : 'en-IN'
  return num.toLocaleString(loc)
}

/**
 * Localized date formatter conforming to Indian statutory and international conventions
 */
export function formatDate(
  dateString: string | Date,
  locale: 'en' | 'hi' | 'gu' = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(d.getTime())) return String(dateString)

    const loc = locale === 'hi' ? 'hi-IN' : locale === 'gu' ? 'gu-IN' : 'en-IN'
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
    return d.toLocaleDateString(loc, defaultOptions)
  } catch {
    return String(dateString)
  }
}
