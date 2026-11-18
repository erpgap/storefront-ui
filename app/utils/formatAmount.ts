import type { Currency } from '~~/graphql'

export type AmountCurrency = Pick<Currency, 'symbol' | 'position' | 'decimalPlaces' | 'decimalSeparator' | 'thousandsSeparator'>

/**
 * `amount` rounded the way Odoo rounds (float_round: half up, after a nudge of
 * one unit in the last place), so 125.955, stored as 125.95499..., is 125.96
 * as in Odoo and not 125.95 as `toFixed` has it.
 */
const roundAmount = (amount: number, places: number): number => {
  const factor = 10 ** places
  const normalized = Math.abs(amount) * factor
  const epsilon = normalized ? 2 ** (Math.log2(normalized) - 52) : 0
  return Math.sign(amount) * Math.round(normalized + epsilon) / factor
}

/**
 * An amount that does not come from Odoo (the price filter's bounds and the
 * range the shopper picks) formatted as Odoo formats the ones it sends
 * (`formatted*`): the currency's symbol, position and decimals, and the shop
 * language's separators. Amounts from the API are shown from their
 * `formatted*` field instead.
 */
export function formatAmount(amount: number, currency: AmountCurrency | null | undefined): string {
  if (!currency) return ''
  const places = currency.decimalPlaces ?? 2
  // Odoo swaps spaces for no-break spaces, so an amount never wraps.
  const thousandsSeparator = (currency.thousandsSeparator ?? ',').replace(/ /g, '\u00A0')

  const [integer, fraction] = Math.abs(roundAmount(amount, places)).toFixed(places).split('.')
  const grouped = integer!.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  const number = `${amount < 0 ? '-' : ''}${grouped}${fraction ? (currency.decimalSeparator ?? '.') + fraction : ''}`

  const symbol = currency.symbol ?? ''
  return currency.position === 'before' ? `${symbol}\u00A0${number}` : `${number}\u00A0${symbol}`
}
